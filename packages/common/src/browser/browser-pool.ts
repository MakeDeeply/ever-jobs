import { Logger } from '@nestjs/common';
import type {
  Browser,
  BrowserContext,
  Page,
  LaunchOptions,
  BrowserContextOptions,
  Request,
  Response,
} from 'playwright';
import type { RawHttpEntry } from '@ever-jobs/models';
import { createHash } from 'crypto';
import { homedir } from 'os';
import { join } from 'path';
import { getRawCapture } from '../context';
import {
  captureRequestBody,
  normalizeBody,
  pushRawEntry,
  redactUrl,
  retainBody,
} from '../http/raw-capture';
import { STEALTH_INIT_SCRIPT, USER_AGENT_POOL, VIEWPORT_POOL } from './stealth-scripts';

/** Options passed to `BrowserPool.getPage()`. */
export interface BrowserPageOptions {
  /** Proxy server URL (e.g. `http://proxy:8080` or `socks5://proxy:1080`). */
  proxy?: string;
  /** Navigation timeout in seconds (used by the caller, not the pool). */
  timeout?: number;
  /**
   * Enable stealth mode for anti-bot evasion.
   * When true, injects scripts to mask webdriver detection, randomizes
   * UA/viewport, and patches browser fingerprinting APIs.
   * Default: false (backwards-compatible).
   */
  stealth?: boolean;
  /**
   * Use a headful (visible) browser instead of the default headless Chromium.
   * Useful for Cloudflare or other bot-detection that rejects headless contexts.
   *
   * Honored only when `EVER_JOBS_BROWSER_HEADFUL` is not `false`; see
   * `headfulEnabled`. A headful request always uses a persistent context.
   */
  headful?: boolean;
  /**
   * Root directory for persistent context profiles. Each distinct launch
   * identity (headful / stealth / proxy) gets its own profile *underneath*
   * this root — see `profileDirFor`.
   */
  userDataDir?: string;
}

/**
 * The inputs that decide whether two persistent-context requests may share one
 * Chromium profile. Chromium locks a profile directory to a single process, and
 * these options can only be applied at launch, so requests that disagree on any
 * of them need separate profiles rather than silent reuse.
 */
interface PersistentIdentity {
  headful: boolean;
  stealth: boolean;
  proxy?: string;
}

/**
 * Shared singleton browser pool for Chromium scraping.
 *
 * Usage:
 *   const page = await BrowserPool.getPage();
 *   try { ... } finally { await page.close(); }
 *
 * For anti-bot protected sites:
 *   const page = await BrowserPool.getPage({ stealth: true, proxy, headful: true });
 *
 * Call `BrowserPool.close()` on app shutdown (e.g. `onModuleDestroy`).
 */
export class BrowserPool {
  private static browser: Browser | null = null;
  private static launching: Promise<Browser> | null = null;
  /** Live persistent contexts, keyed by launch identity (see `identityKey`). */
  private static readonly persistentContexts: Map<string, BrowserContext> = new Map();
  private static readonly persistentLaunching: Map<string, Promise<BrowserContext>> = new Map();
  /**
   * Contexts Playwright has told us are gone. A `BrowserContext` exposes no
   * `isConnected()`, so liveness is tracked by subscribing to its `close` event
   * rather than inferred from a method call that cannot fail.
   */
  private static readonly closedContexts = new WeakSet<BrowserContext>();
  /** Contexts the stealth init script has already been registered on. */
  private static readonly stealthApplied = new WeakSet<BrowserContext>();
  /** The blank page `launchPersistentContext` opens for us, pending disposal. */
  private static readonly initialPages = new WeakMap<BrowserContext, Page[]>();
  private static readonly logger = new Logger(BrowserPool.name);

  /** Default Chromium launch options. */
  private static readonly DEFAULT_OPTS: LaunchOptions = {
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  };

  /** Root directory holding persistent context profiles. */
  private static get defaultUserDataDir(): string {
    return process.env.PLAYWRIGHT_USER_DATA_DIR ?? join(homedir(), '.cache', 'ever-jobs', 'chromium-profile');
  }

  /**
   * Whether a `headful: true` request is honored. Headful needs a display
   * server, which no deployed environment has, so this is the kill switch that
   * forces every caller back onto the headless path without a code change.
   */
  private static get headfulEnabled(): boolean {
    return process.env.EVER_JOBS_BROWSER_HEADFUL !== 'false';
  }

  /** Default (non-stealth) User-Agent string. */
  private static readonly DEFAULT_USER_AGENT = USER_AGENT_POOL[0];

  /** Pick a random element from an array. */
  private static pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Get (or lazily launch) a shared Chromium browser instance.
   */
  static async getBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) return this.browser;

    // Prevent multiple concurrent launches
    if (this.launching) return this.launching;

    this.launching = (async () => {
      try {
        this.logger.log('Launching headless Chromium…');
        // Dynamic import — playwright may not be installed in all environments
        const { chromium } = await import('playwright');
        const browser = await chromium.launch(this.DEFAULT_OPTS);
        this.browser = browser;
        this.logger.log('Chromium launched');
        return browser;
      } catch (err) {
        // Reset the guard so subsequent calls can retry the launch
        this.launching = null;
        throw err;
      }
    })();

    return this.launching;
  }

  /** Cache key for a persistent context: the profile root plus its identity. */
  private static identityKey(userDataDir: string, identity: PersistentIdentity): string {
    return `${userDataDir}|${identity.headful}|${identity.stealth}|${identity.proxy ?? ''}`;
  }

  /**
   * Profile directory for one launch identity, nested under the configured
   * root. Two requests that disagree on proxy, stealth or headfulness cannot
   * share a profile — Chromium locks the directory to one process, and a
   * session pinned to one egress IP must not be replayed through another — so
   * each identity gets a deterministic sibling directory instead.
   */
  private static profileDirFor(userDataDir: string, identity: PersistentIdentity): string {
    const digest = createHash('sha1')
      .update(this.identityKey('', identity))
      .digest('hex')
      .slice(0, 8);
    return join(userDataDir, digest);
  }

  /**
   * Get (or lazily launch) a persistent Chromium context for one launch
   * identity. Contexts are cached per identity, never per directory alone —
   * caching on the directory would silently impose the first caller's proxy,
   * User-Agent and viewport on every later caller.
   */
  static async getPersistentContext(
    userDataDir: string,
    identity: PersistentIdentity,
    ctxOpts: BrowserContextOptions,
  ): Promise<BrowserContext> {
    const key = this.identityKey(userDataDir, identity);

    const existing = this.persistentContexts.get(key);
    if (existing && this.isContextUsable(existing)) return existing;
    // A context that closed under us must not be handed out again.
    if (existing) this.persistentContexts.delete(key);

    const launching = this.persistentLaunching.get(key);
    if (launching) return launching;

    const profileDir = this.profileDirFor(userDataDir, identity);
    const promise = (async () => {
      this.logger.log(
        `Launching persistent Chromium context (headful=${identity.headful}) at ${profileDir}…`,
      );
      const { chromium } = await import('playwright');
      const context = await chromium.launchPersistentContext(profileDir, {
        ...this.DEFAULT_OPTS,
        ...ctxOpts,
        headless: identity.headful ? false : this.DEFAULT_OPTS.headless,
      });

      // `launchPersistentContext` opens a blank page we never asked for. Hold
      // it until the caller's first real page exists, then dispose of it —
      // closing every page of a persistent context can take the context down.
      this.initialPages.set(context, context.pages());

      context.on('close', () => {
        this.closedContexts.add(context);
        this.evictContext(context);
      });

      this.persistentContexts.set(key, context);
      this.logger.log('Persistent Chromium context launched');
      return context;
    })();

    this.persistentLaunching.set(key, promise);
    // Clear the in-flight guard on both paths: leaving a settled promise in the
    // map made a failed launch un-retryable until the process restarted.
    return promise.finally(() => this.persistentLaunching.delete(key));
  }

  /**
   * Create a fresh page with configurable stealth level.
   * The caller is responsible for closing the page when done.
   *
   * @param opts.proxy      — route all traffic through this proxy server
   * @param opts.stealth    — enable anti-bot evasion (UA/viewport rotation, JS patches)
   * @param opts.headful    — launch a headful persistent context (see `headfulEnabled`)
   * @param opts.userDataDir — root directory for persistent context profiles
   */
  static async getPage(opts?: BrowserPageOptions): Promise<Page> {
    const stealth = opts?.stealth ?? false;
    const headful = this.resolveHeadful(opts?.headful ?? false);
    const wantsPersistent = headful || !!opts?.userDataDir;

    const ctxOpts: BrowserContextOptions = {
      userAgent: stealth ? this.pick(USER_AGENT_POOL) : this.DEFAULT_USER_AGENT,
      viewport: stealth ? this.pick(VIEWPORT_POOL) : { width: 1440, height: 900 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      javaScriptEnabled: true,
    };

    if (opts?.proxy) {
      ctxOpts.proxy = { server: opts.proxy };
    }

    if (wantsPersistent) {
      const userDataDir = opts?.userDataDir ?? this.defaultUserDataDir;
      const identity: PersistentIdentity = { headful, stealth, proxy: opts?.proxy };
      const context = await this.getPersistentContext(userDataDir, identity, ctxOpts);
      await this.applyStealthToContext(context, stealth);
      const page = await context.newPage();
      await this.disposeInitialPages(context);
      attachRawCapture(page);
      return page;
    }

    const browser = await this.getBrowser();
    const context = await browser.newContext(ctxOpts);
    await this.applyStealthToContext(context, stealth);
    const page = await context.newPage();
    attachRawCapture(page);
    return page;
  }

  /**
   * Gracefully shut down the browser and all persistent contexts.
   * Safe to call multiple times.
   */
  static async close(): Promise<void> {
    for (const [key, context] of this.persistentContexts) {
      this.logger.log(`Closing persistent Chromium context ${key}…`);
      await context.close().catch(() => {});
    }
    this.persistentContexts.clear();
    this.persistentLaunching.clear();
    this.launching = null;

    if (this.browser) {
      this.logger.log('Closing Chromium…');
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }

  /** Honor `headful` only where a display server can plausibly exist. */
  private static resolveHeadful(requested: boolean): boolean {
    if (!requested) return false;
    if (this.headfulEnabled) return true;

    this.logger.warn(
      'Headful browser requested but EVER_JOBS_BROWSER_HEADFUL=false — using headless',
    );
    return false;
  }

  /**
   * Register the shared stealth init script on a context, once. Playwright
   * accumulates init scripts per context and replays all of them into every new
   * page, so re-registering on each `getPage()` against a long-lived persistent
   * context grew without bound.
   */
  private static async applyStealthToContext(context: BrowserContext, stealth: boolean): Promise<void> {
    if (!stealth || this.stealthApplied.has(context)) return;

    await context.addInitScript(STEALTH_INIT_SCRIPT);
    this.stealthApplied.add(context);
  }

  /** Close the blank page Playwright opened with a persistent context. */
  private static async disposeInitialPages(context: BrowserContext): Promise<void> {
    const pending = this.initialPages.get(context);
    if (!pending?.length) return;

    this.initialPages.delete(context);
    for (const page of pending) {
      if (!page.isClosed()) await page.close().catch(() => {});
    }
  }

  /** Whether a cached persistent context is still usable. */
  private static isContextUsable(context: BrowserContext): boolean {
    return !this.closedContexts.has(context);
  }

  /** Drop a dead context so the next request relaunches instead of reusing it. */
  private static evictContext(context: BrowserContext): void {
    for (const [key, cached] of this.persistentContexts) {
      if (cached === context) {
        this.persistentContexts.delete(key);
        this.logger.warn(`Persistent Chromium context closed unexpectedly (${key}) — evicted`);
        return;
      }
    }
  }
}

/** Resource types worth capturing — js/css/img/font/analytics would only burn the budget. */
const RAW_CAPTURE_RESOURCE_TYPES = new Set(['document', 'xhr', 'fetch']);

/**
 * Spec 5161 — attach raw-HTTP capture listeners to a Playwright page.
 *
 * Called by `BrowserPool.getPage()` on every page it returns, and directly by
 * the two sources that skip the pool (`source-tesla-playwright`,
 * `source-ats-kula_ai`) right after `browser.newPage()`.
 *
 * The sink is read **once** here and closed over: Playwright dispatches
 * `page.on(...)` handlers from its connection message loop, where the
 * AsyncLocalStorage context is not active, so a handler that looked the sink
 * up at event time would find nothing.
 *
 * Listeners attach to the page, never the context — persistent contexts are
 * shared across sources and would leak other sources' traffic into the sink.
 * Pages die with their listeners, so no cleanup is needed.
 */
export function attachRawCapture(page: Page): void {
  const sink = getRawCapture();
  if (!sink) return;

  /** Responses keyed by the chain head — lets `finish` stay synchronous. */
  const responses = new Map<Request, Response>();
  /** Body reads keyed by the chain head, started on `response`. */
  const pendingBodies = new Map<Request, Promise<Buffer | null>>();
  const startTimes = new Map<Request, number>();
  /** One entry per redirect chain, keyed by its head request. */
  const entryByHead = new Map<Request, RawHttpEntry>();

  const headOf = (request: Request): Request => {
    let head = request;
    for (;;) {
      const prev = head.redirectedFrom();
      if (!prev) return head;
      head = prev;
    }
  };

  const recordable = (request: Request): boolean =>
    RAW_CAPTURE_RESOURCE_TYPES.has(request.resourceType());

  /** Entry for the chain `request` belongs to, created on first sight. */
  const entryFor = (request: Request): RawHttpEntry | null => {
    const head = headOf(request);
    let entry = entryByHead.get(head);
    if (!entry) {
      const pushed = pushRawEntry(sink, {
        attempt: 0,
        method: head.method(),
        url: redactUrl(head.url()),
        status: null,
        elapsed_ms: 0,
        body_bytes: 0,
        truncated: false,
        request_body: captureRequestBody(head.postData()),
      });
      if (!pushed) return null;
      entry = pushed;
      entryByHead.set(head, entry);
    }
    if (request !== head && request.url() !== head.url()) {
      entry.final_url = redactUrl(request.url());
    }
    return entry;
  };

  const elapsedOf = (request: Request): number => {
    const end = request.timing()?.responseEnd;
    if (typeof end === 'number' && end >= 0) return Math.round(end);
    const started = startTimes.get(headOf(request));
    return started === undefined ? 0 : Date.now() - started;
  };

  page.on('request', (request) => {
    if (sink.closed || !recordable(request)) return;
    startTimes.set(request, Date.now());
  });

  // Start the body read on `response` so it is already queued before the
  // plugin's `page.close()` — plugins close the page as soon as parsing is
  // done, and `response.body()` rejects on a closed page.
  page.on('response', (response) => {
    if (sink.closed) return;
    const request = response.request();
    if (!recordable(request)) return;
    const head = headOf(request);
    responses.set(head, response);
    pendingBodies.set(head, response.body().catch(() => null));
  });

  const finish = (request: Request, failure: string | null): void => {
    if (sink.closed || !recordable(request)) return;
    const entry = entryFor(request);
    if (!entry) return;
    entry.elapsed_ms = elapsedOf(request);
    if (failure !== null) {
      entry.error = failure;
      return;
    }
    const response = responses.get(headOf(request));
    if (response) {
      entry.status = response.status();
      entry.content_type = response.headers()['content-type'];
    }
    const head = headOf(request);
    const bodyPromise = pendingBodies.get(head);
    if (bodyPromise) {
      const contentType = entry.content_type;
      const tracked = bodyPromise
        .then((buf) => {
          if (buf === null) {
            entry.truncated = true;
            return;
          }
          const text = buf.toString('utf8');
          let value: unknown = text;
          if (contentType?.includes('json')) {
            try {
              value = JSON.parse(text);
            } catch {
              /* keep the raw text */
            }
          }
          retainBody(sink, entry, normalizeBody(value, contentType));
        })
        .catch(() => {
          entry.truncated = true;
        });
      sink.pending.push(tracked);
    }
  };

  page.on('requestfinished', (request) => finish(request, null));
  page.on('requestfailed', (request) =>
    finish(request, request.failure()?.errorText ?? 'request failed'),
  );
}
