import { Injectable, Logger, OnModuleDestroy, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { NextFunction, Request, Response } from 'express';
import { resolveShutdownDrainTimeoutMs } from '../config/shutdown-config';

/**
 * Paths that are never counted as in-flight work and never refused while
 * draining (Spec 1753 FR-3): the probes and the Prometheus scrape. `/health`
 * must keep answering 200 during a drain — it is the liveness probe, and a
 * liveness failure would kill the container mid-drain.
 */
export const DRAIN_EXEMPT_PATHS: ReadonlySet<string> = new Set([
  '/health',
  '/ping',
  '/ready',
  '/metrics',
]);

/** `Retry-After` (seconds) sent with a request refused because this instance is draining. */
export const DRAIN_RETRY_AFTER_SECONDS = 1;

/** How often a drain still waiting logs its progress. */
export const DRAIN_PROGRESS_LOG_INTERVAL_MS = 30_000;

/** How a drain ended (Spec 1753 FR-5). */
export interface DrainOutcome {
  /** `true` when every in-flight request finished within the timeout. */
  readonly drained: boolean;
  /** Requests still open when the drain stopped waiting (`0` when drained). */
  readonly remaining: number;
  /** Time spent waiting, ms. */
  readonly waitedMs: number;
}

/** The URL path of a request, without the query string or a trailing slash. */
function requestPath(req: Request): string {
  const raw = (req.originalUrl ?? req.url ?? '/').split('?')[0] || '/';
  return raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

/**
 * Graceful-shutdown drain (Spec 1753, homelab EJ-6).
 *
 * A list-mode NDJSON crawl can run for the whole fan-out deadline (400 s in
 * the deployments). Before this, SIGTERM killed it mid-stream: no shutdown
 * hooks were enabled, and the pod's grace period was 30 s. Now:
 *
 * 1. `beginDrain()` — called by the SIGTERM listener {@link installGracefulShutdown}
 *    registers ahead of Nest's — flips readiness: `GET /ready` answers 503, and
 *    every new request except the probes ({@link DRAIN_EXEMPT_PATHS}) is
 *    refused with 503, `Retry-After` and `Connection: close`, so the client
 *    retries on another instance.
 * 2. Nest's shutdown sequence then calls `onModuleDestroy()` here FIRST — this
 *    provider sits in the root `AppModule`, the module with the lowest
 *    distance, whose teardown hooks Nest runs before every other module's.
 *    It waits until the in-flight requests finish or `drainTimeoutMs` passes.
 *    Only then do the other modules' teardown hooks run (plugins close their
 *    browsers, the Postgres store disconnects), so a draining search keeps
 *    the resources it is using.
 * 3. On timeout the open connections are closed, so the HTTP server's own
 *    `close()` (next in Nest's sequence) does not wait past the bound.
 *
 * `app.close()` without a SIGTERM (tests, embedding) does not wait: the drain
 * only runs once `beginDrain()` was called.
 */
@Injectable()
export class ShutdownDrainService implements OnModuleDestroy {
  private readonly logger = new Logger(ShutdownDrainService.name);

  /** Upper bound on the wait for in-flight requests, ms (`0` = do not wait). */
  readonly drainTimeoutMs: number;

  private draining = false;
  private drainReason: string | undefined;
  private inFlight = 0;
  private idleWaiters: Array<() => void> = [];
  private drainPromise: Promise<DrainOutcome> | undefined;

  constructor(
    @Optional() config?: ConfigService,
    @Optional() private readonly adapterHost?: HttpAdapterHost,
  ) {
    const configured = config?.get<number>('shutdown.drainTimeoutMs');
    this.drainTimeoutMs =
      typeof configured === 'number' && Number.isFinite(configured)
        ? Math.max(0, Math.floor(configured))
        : resolveShutdownDrainTimeoutMs(process.env);
  }

  /** Whether a drain has begun (readiness fails, new requests are refused). */
  isDraining(): boolean {
    return this.draining;
  }

  /** Requests currently being served, probes excluded. */
  inFlightCount(): number {
    return this.inFlight;
  }

  /**
   * Start draining. Idempotent: a second call (a second signal) changes nothing.
   * Synchronous, so readiness flips before Nest's own signal handler runs.
   */
  beginDrain(reason = 'SIGTERM'): void {
    if (this.draining) return;
    this.draining = true;
    this.drainReason = reason;
    this.logger.warn(
      `${reason} received: draining — GET /ready now answers 503 and new requests are refused; ` +
        `waiting up to ${Math.round(this.drainTimeoutMs / 1000)}s for ${this.inFlight} in-flight request(s)`,
    );
  }

  /**
   * Express middleware: counts every request except the probes while it is
   * served, and refuses new ones once draining. Bound so it can be passed to
   * `app.use()` directly.
   */
  readonly middleware = (req: Request, res: Response, next: NextFunction): void => {
    if (DRAIN_EXEMPT_PATHS.has(requestPath(req))) {
      next();
      return;
    }
    if (this.draining) {
      this.refuse(res);
      return;
    }
    this.track(res);
    next();
  };

  /**
   * Count `res` as in flight until it closes — finished, or the client left.
   * A streamed NDJSON response stays counted until its last line is written.
   */
  track(res: Response): void {
    this.inFlight++;
    let released = false;
    const release = (): void => {
      if (released) return;
      released = true;
      this.inFlight--;
      if (this.inFlight === 0) this.notifyIdle();
    };
    res.once('finish', release);
    res.once('close', release);
  }

  /**
   * Wait until no request is in flight, or `timeoutMs` passes. Resolves, never
   * rejects.
   */
  waitForInFlight(timeoutMs: number = this.drainTimeoutMs): Promise<DrainOutcome> {
    const started = Date.now();
    if (this.inFlight === 0) {
      return Promise.resolve({ drained: true, remaining: 0, waitedMs: 0 });
    }
    if (timeoutMs <= 0) {
      return Promise.resolve({ drained: false, remaining: this.inFlight, waitedMs: 0 });
    }
    return new Promise<DrainOutcome>((resolve) => {
      let settled = false;
      const settle = (drained: boolean): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clearInterval(progress);
        this.idleWaiters = this.idleWaiters.filter((w) => w !== onIdle);
        resolve({
          drained,
          remaining: drained ? 0 : this.inFlight,
          waitedMs: Date.now() - started,
        });
      };
      const onIdle = (): void => settle(true);
      this.idleWaiters.push(onIdle);
      const timer = setTimeout(() => settle(false), timeoutMs);
      const progress = setInterval(() => {
        this.logger.log(
          `Still draining: ${this.inFlight} request(s) in flight after ` +
            `${Math.round((Date.now() - started) / 1000)}s of ${Math.round(timeoutMs / 1000)}s`,
        );
      }, DRAIN_PROGRESS_LOG_INTERVAL_MS);
      progress.unref?.();
    });
  }

  /**
   * Run the drain once: wait for the in-flight requests, and on timeout close
   * the connections still open so the HTTP server can close within the bound.
   * Memoised — every caller gets the same outcome.
   */
  drain(): Promise<DrainOutcome> {
    if (!this.drainPromise) {
      this.drainPromise = this.waitForInFlight().then((outcome) => {
        if (outcome.drained) {
          this.logger.log(
            `Drain complete after ${Math.round(outcome.waitedMs / 1000)}s: no request in flight; closing`,
          );
        } else {
          this.logger.warn(
            `Drain timeout (${Math.round(this.drainTimeoutMs / 1000)}s, ` +
              `EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS) reached with ${outcome.remaining} request(s) ` +
              `still in flight; closing their connections`,
          );
          this.closeOpenConnections();
        }
        return outcome;
      });
    }
    return this.drainPromise;
  }

  /**
   * Nest teardown hook. Runs before every other module's (root module), so the
   * other modules' resources stay up while in-flight requests finish. No-op
   * unless a drain was begun — a plain `app.close()` does not wait.
   */
  async onModuleDestroy(): Promise<void> {
    if (!this.draining) return;
    await this.drain();
  }

  private refuse(res: Response): void {
    res.setHeader('Retry-After', String(DRAIN_RETRY_AFTER_SECONDS));
    res.setHeader('Connection', 'close');
    res.status(503).json({
      error: 'Service Unavailable',
      detail: 'This instance is shutting down; retry the request.',
      statusCode: 503,
      reason: this.drainReason ?? 'shutdown',
      timestamp: new Date().toISOString(),
    });
  }

  private notifyIdle(): void {
    const waiters = this.idleWaiters;
    this.idleWaiters = [];
    for (const waiter of waiters) waiter();
  }

  private closeOpenConnections(): void {
    const server = this.adapterHost?.httpAdapter?.getHttpServer?.() as
      | { closeAllConnections?: () => void }
      | undefined;
    try {
      server?.closeAllConnections?.();
    } catch (err) {
      this.logger.warn(`Closing open connections failed: ${(err as Error).message}`);
    }
  }
}
