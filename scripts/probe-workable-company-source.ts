/**
 * probe-workable-company-source.ts
 *
 * Reusable, deterministic **discovery** helper for **Workable-backed**
 * company-direct source candidates. Given a newline-separated candidate-slug
 * file, it concurrently probes each slug against the public Workable widget
 * careers API and emits a survivors JSON whose shape feeds directly into the
 * descriptor-assembly step of the Workable company-source pipeline:
 *
 *   - Job board (public, zero-auth):
 *       https://apply.workable.com/api/v1/widget/accounts/<slug>
 *
 * Like Recruitee (`{ offers: [...] }`) and SmartRecruiters (`{ content: [...] }`)
 * — and unlike Lever/Ashby (bare JSON arrays) — the public Workable widget API
 * returns a **JSON envelope** `{ jobs: [...] }`. Unlike Recruitee (per-company
 * subdomain host) the Workable widget API is served from a **single shared host**
 * (`apply.workable.com`) with the account slug in the path — the same host model
 * as Greenhouse. Each job carries `title` + `shortcode`; a board display name is
 * NOT reliably on the widget wire, so `boardName` is left `''` and the gate stays
 * purely count-based: a candidate SURVIVES iff
 *   (a) the endpoint returns HTTP 200 with a `jobs` array, AND
 *   (b) that array holds >= MIN_JOBS live jobs, each carrying a `title`.
 *
 * Brand-match is enforced downstream at descriptor-assembly time (the verified
 * `displayName` + `companySlug` pair), NOT from the wire — same rationale as the
 * Ashby / Lever / SmartRecruiters / Recruitee probes (`docs/questions.md`
 * Q-ASHBY-1 / Q-LEVER-1 / Q-SR-1 / Q-RECRUITEE-1 / Q-WORKABLE-1).
 *
 * Network I/O is isolated in `probeOne`; the gate + listing-extraction logic is
 * factored into the pure, unit-tested helpers `gateBoard` and `extractListings`
 * so the decision surface can be exercised without hitting the live host.
 *
 * Usage (via ts-node):
 *   ts-node --project tsconfig.base.json -r tsconfig-paths/register \
 *     scripts/probe-workable-company-source.ts .candidates.txt .survivors.json
 *
 * The survivors file is overwritten on each run. This script NEVER mutates the
 * repository — it only reads a candidate list and writes the survivors JSON.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

/** Minimum live-role count for a candidate board to survive the gate. */
export const MIN_JOBS = 3;
/**
 * Max concurrent in-flight probes. The public Workable widget host
 * (`apply.workable.com`) sits behind Cloudflare and returns **HTTP 429 /
 * "error code: 1015"** on bursty traffic (a burst of ~380 concurrent-ish
 * requests trips it for minutes). We therefore probe **politely**: a low
 * concurrency ceiling plus a per-request inter-call delay and 1015-aware
 * backoff (see `getJson`). Override via `PROBE_CONCURRENCY` env for a slower run.
 */
export const PROBE_CONCURRENCY = Number(process.env.PROBE_CONCURRENCY) || 4;
/** Delay (ms) a worker waits before each successive request (politeness). */
export const PROBE_DELAY_MS = Number(process.env.PROBE_DELAY_MS) || 300;
/** Max retries when a request is rate-limited (Cloudflare 1015 / HTTP 429). */
export const PROBE_MAX_RETRIES = Number(process.env.PROBE_MAX_RETRIES) || 3;

/** Resolve after `ms` milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ProbedListing {
  id: number | string;
  title: string;
  location: string | null;
  department: string | null;
  updatedAt: string | null;
}

export interface Survivor {
  slug: string;
  /**
   * The Workable widget envelope carries a top-level `name` (usually the account
   * slug echoed back, occasionally a nicer brand name), captured here for parity
   * with the Greenhouse/Recruitee probes. Informational only — downstream
   * assembly always prefers the verified descriptor `displayName`. Falls back to
   * `''` when absent.
   */
  boardName: string;
  jobCount: number;
  listings: ProbedListing[];
}

/** Raw shape of a single Workable widget location entry (only fields we read). */
interface RawWorkableLocation {
  city?: string | null;
  region?: string | null;
  country?: string | null;
}

/** Raw shape of a Workable widget job (only fields we read). */
interface RawWorkableJob {
  /** Workable's stable per-job identifier. */
  shortcode?: string | null;
  code?: string | null;
  /** Workable carries the job title in `title`. */
  title?: string;
  employment_type?: string | null;
  telecommuting?: boolean | null;
  department?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  locations?: RawWorkableLocation[] | null;
  /** ISO-ish publication timestamp. */
  published_on?: string | null;
  created_at?: string | null;
}

/** Raw shape of the public Workable widget API envelope. */
interface RawWorkableEnvelope {
  /** Board display name — usually the account slug, occasionally a brand name. */
  name?: string | null;
  jobs?: RawWorkableJob[] | null;
}

/**
 * Compose a human-readable location string from a Workable widget job. Prefers
 * the first structured `locations[]` entry, else the flat city/state/country,
 * else flags remote via `telecommuting`.
 */
function composeLocation(job: RawWorkableJob): string | null {
  const primary = Array.isArray(job.locations) ? job.locations[0] : null;
  const city = primary?.city ?? job.city ?? null;
  const state = primary?.region ?? job.state ?? null;
  const country = primary?.country ?? job.country ?? null;
  const parts = [city, state, country]
    .map((p) => (p ? String(p).trim() : ''))
    .filter(Boolean);
  if (parts.length) return parts.join(', ');
  if (job.telecommuting) return 'Remote';
  return null;
}

/**
 * Parse a loose Workable timestamp (ISO or `"YYYY-MM-DD"`) into a strict
 * ISO-8601 string, or `null` when unparseable.
 */
function toIso(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

/**
 * Pure listing extractor: normalise the first `limit` raw Workable jobs into the
 * `ProbedListing` shape consumed downstream. Defensive against missing fields;
 * trims string values so padded wire data never leaks through. Reads the `jobs`
 * array off the envelope.
 */
export function extractListings(
  envelope: unknown,
  limit: number,
): ProbedListing[] {
  const jobs =
    envelope && typeof envelope === 'object'
      ? (envelope as RawWorkableEnvelope).jobs
      : null;
  if (!Array.isArray(jobs)) return [];
  const out: ProbedListing[] = [];
  for (const j of jobs as RawWorkableJob[]) {
    if (out.length >= limit) break;
    const title = String(j?.title ?? '').trim();
    if (!title) continue;
    const locName = composeLocation(j ?? {});
    const deptRaw = j?.department ?? null;
    const deptName = deptRaw ? String(deptRaw).trim() : null;
    out.push({
      id: j?.shortcode ?? j?.code ?? '',
      title,
      location: locName || null,
      department: deptName || null,
      updatedAt: toIso(j?.published_on ?? j?.created_at),
    });
  }
  return out;
}

/**
 * Pure gate predicate. Returns a `Survivor` when the board clears the gate,
 * otherwise `null`. Accepts an already-parsed widget-API envelope so it is fully
 * deterministic and unit-testable without network access.
 *
 * The gate is purely count-based: the `jobs` array must hold >= `minJobs`
 * title-bearing jobs. `boardName` is taken from the envelope's `name` field
 * (informational; falls back to `''`).
 */
export function gateBoard(
  slug: string,
  boardPayload: unknown,
  minJobs: number = MIN_JOBS,
): Survivor | null {
  const envelope =
    boardPayload && typeof boardPayload === 'object'
      ? (boardPayload as RawWorkableEnvelope)
      : null;
  const jobs = envelope ? envelope.jobs : null;
  const jobCount = Array.isArray(jobs) ? jobs.length : 0;
  if (jobCount < minJobs) return null;

  // Require the full minJobs of title-bearing rows (defends against a board of
  // placeholder/empty jobs), then cap the seed listings at 3 for parity with the
  // Recruitee/Lever/Ashby/SmartRecruiters/Greenhouse probes.
  const titledCount = extractListings(boardPayload, jobCount).length;
  if (titledCount < minJobs) return null;

  const boardName = envelope?.name ? String(envelope.name).trim() : '';
  const listings = extractListings(boardPayload, 3);
  return { slug, boardName, jobCount, listings };
}

/** Outcome of a single HTTP fetch: parsed JSON, a genuine miss, or rate-limited. */
type FetchResult =
  | { status: 'ok'; json: unknown }
  | { status: 'miss' }
  | { status: 'ratelimited' };

/**
 * Minimal promise-based HTTPS GET. Distinguishes a genuine miss (404 / non-JSON
 * body / network error) from a Cloudflare rate-limit (HTTP 429 / 503, or a body
 * that opens with `error code: 1015`) so the caller can back off and retry the
 * latter rather than discarding a real candidate.
 */
function getJson(url: string, timeoutMs: number): Promise<FetchResult> {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        timeout: timeoutMs,
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36',
        },
      },
      (res) => {
        const code = res.statusCode ?? 0;
        if (code === 429 || code === 503) {
          res.resume();
          resolve({ status: 'ratelimited' });
          return;
        }
        if (code !== 200) {
          res.resume();
          resolve({ status: 'miss' });
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c as Buffer));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          if (/^\s*error code:\s*1015/i.test(body)) {
            resolve({ status: 'ratelimited' });
            return;
          }
          try {
            resolve({ status: 'ok', json: JSON.parse(body) });
          } catch {
            resolve({ status: 'miss' });
          }
        });
      },
    );
    req.on('error', () => resolve({ status: 'miss' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'miss' });
    });
  });
}

/**
 * Fetch a URL, transparently retrying on rate-limit with exponential backoff.
 * Returns the parsed JSON, or `null` on a genuine miss / exhausted retries.
 */
async function getJsonWithRetry(
  url: string,
  timeoutMs: number,
  maxRetries = PROBE_MAX_RETRIES,
): Promise<unknown> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await getJson(url, timeoutMs);
    if (result.status === 'ok') return result.json;
    if (result.status === 'miss') return null;
    // rate-limited: back off (1s, 2s, 4s, …) then retry.
    if (attempt < maxRetries) await sleep(1000 * 2 ** attempt);
  }
  return null;
}

/** Build the public Workable widget-API URL for a slug (shared host, path slug). */
export function boardUrl(slug: string): string {
  return `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(slug)}`;
}

/** Probe one slug against the public widget endpoint; resolve or `null`. */
export async function probeOne(
  slug: string,
  timeoutMs = 12000,
): Promise<Survivor | null> {
  const board = await getJsonWithRetry(boardUrl(slug), timeoutMs);
  return gateBoard(slug, board);
}

/** Probe a list of slugs with a bounded-concurrency worker pool. */
export async function probeAll(
  slugs: string[],
  concurrency = PROBE_CONCURRENCY,
): Promise<Survivor[]> {
  const survivors: Survivor[] = [];
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < slugs.length) {
      const idx = cursor++;
      const slug = slugs[idx];
      // Polite inter-request delay so the Cloudflare-fronted host isn't bursted.
      if (PROBE_DELAY_MS > 0) await sleep(PROBE_DELAY_MS);
      const survivor = await probeOne(slug);
      if (survivor) {
        survivors.push(survivor);
        // eslint-disable-next-line no-console
        console.log(`  ✓ ${slug} — ${survivor.jobCount} live role(s)`);
      }
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, slugs.length) },
    () => worker(),
  );
  await Promise.all(workers);
  // Stable ordering for deterministic batch assembly.
  survivors.sort((a, b) => a.slug.localeCompare(b.slug));
  return survivors;
}

async function main(): Promise<void> {
  const candidatesPath = process.argv[2] || '.candidates.txt';
  const survivorsPath = process.argv[3] || '.survivors.json';
  const repoRoot = process.cwd();
  const cAbs = path.isAbsolute(candidatesPath)
    ? candidatesPath
    : path.join(repoRoot, candidatesPath);
  const sAbs = path.isAbsolute(survivorsPath)
    ? survivorsPath
    : path.join(repoRoot, survivorsPath);

  const slugs = fs
    .readFileSync(cAbs, 'utf8')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('#'));

  // eslint-disable-next-line no-console
  console.log(
    `Probing ${slugs.length} Workable candidate slug(s) @ concurrency ${PROBE_CONCURRENCY}…`,
  );
  const survivors = await probeAll(slugs);
  fs.writeFileSync(sAbs, JSON.stringify(survivors, null, 2) + '\n');
  // eslint-disable-next-line no-console
  console.log(
    `\nDone. ${survivors.length}/${slugs.length} survived → ${survivorsPath}`,
  );
}

if (require.main === module) {
  void main();
}
