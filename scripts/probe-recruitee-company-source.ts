/**
 * probe-recruitee-company-source.ts
 *
 * Reusable, deterministic **discovery** helper for **Recruitee-backed**
 * company-direct source candidates. Given a newline-separated candidate-slug
 * file, it concurrently probes each slug against the public Recruitee careers
 * API and emits a survivors JSON whose shape feeds directly into the
 * descriptor-assembly step of the Recruitee company-source pipeline:
 *
 *   - Job board (public, zero-auth):
 *       https://<slug>.recruitee.com/api/offers
 *
 * Like SmartRecruiters (`{ content: [...] }`) — and unlike Lever/Ashby (bare
 * JSON arrays) — the public Recruitee careers API returns a **JSON envelope**
 * `{ offers: [...] }`. Each offer additionally carries `company_name`, so a
 * board display name IS available on the wire and is captured into `boardName`
 * for informational parity with the Greenhouse / SmartRecruiters probes. The
 * gate itself stays purely count-based (no brand-match on the wire): a candidate
 * SURVIVES iff
 *   (a) the endpoint returns HTTP 200 with an `offers` array, AND
 *   (b) that array holds >= MIN_JOBS live offers, each carrying a `title`.
 *
 * Brand-match is enforced downstream at descriptor-assembly time (the verified
 * `displayName` + `companySlug` pair), NOT from the wire — same rationale as the
 * Ashby / Lever / SmartRecruiters probes (`docs/questions.md`
 * Q-ASHBY-1 / Q-LEVER-1 / Q-SR-1 / Q-RECRUITEE-1).
 *
 * Network I/O is isolated in `probeOne`; the gate + listing-extraction logic is
 * factored into the pure, unit-tested helpers `gateBoard` and `extractListings`
 * so the decision surface can be exercised without hitting the live host.
 *
 * Usage (via ts-node):
 *   ts-node --project tsconfig.base.json -r tsconfig-paths/register \
 *     scripts/probe-recruitee-company-source.ts .candidates.txt .survivors.json
 *
 * The survivors file is overwritten on each run. This script NEVER mutates the
 * repository — it only reads a candidate list and writes the survivors JSON.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

/** Minimum live-role count for a candidate board to survive the gate. */
export const MIN_JOBS = 3;
/** Max concurrent in-flight probes (politeness + socket ceiling). */
export const PROBE_CONCURRENCY = 16;

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
   * Recruitee exposes `company_name` on each offer, so — like the
   * SmartRecruiters survivors — a real board display name is captured here
   * (falls back to `''` when absent). Downstream assembly still prefers the
   * verified descriptor `displayName`; this is informational.
   */
  boardName: string;
  jobCount: number;
  listings: ProbedListing[];
}

/** Raw shape of a Recruitee public offer (only fields we read). */
interface RawRecruiteeOffer {
  id?: number | string;
  /** Recruitee carries the job title in `title`. */
  title?: string;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  remote?: boolean | null;
  department?: string | null;
  company_name?: string | null;
  /** ISO-ish creation timestamp, e.g. "2026-06-22 13:37:27 UTC". */
  created_at?: string | null;
}

/** Raw shape of the public Recruitee careers API envelope. */
interface RawRecruiteeEnvelope {
  offers?: RawRecruiteeOffer[] | null;
}

/**
 * Compose a human-readable location string from a Recruitee offer. Prefers the
 * pre-composed `location` field, else joins city/state/country, else flags
 * remote.
 */
function composeLocation(offer: RawRecruiteeOffer): string | null {
  const full = offer.location ? String(offer.location).trim() : '';
  if (full) return full;
  const parts = [offer.city, offer.state, offer.country]
    .map((p) => (p ? String(p).trim() : ''))
    .filter(Boolean);
  if (parts.length) return parts.join(', ');
  if (offer.remote) return 'Remote';
  return null;
}

/**
 * Parse the loose Recruitee timestamp (`"2026-06-22 13:37:27 UTC"` or ISO) into
 * a strict ISO-8601 string, or `null` when unparseable.
 */
function toIso(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const t = Date.parse(raw.replace(' UTC', 'Z').replace(' ', 'T'));
  if (Number.isFinite(t)) return new Date(t).toISOString();
  const t2 = Date.parse(raw);
  return Number.isFinite(t2) ? new Date(t2).toISOString() : null;
}

/**
 * Pure listing extractor: normalise the first `limit` raw Recruitee offers into
 * the `ProbedListing` shape consumed downstream. Defensive against missing
 * fields; trims string values so padded wire data never leaks through. Reads the
 * `offers` array off the envelope.
 */
export function extractListings(
  envelope: unknown,
  limit: number,
): ProbedListing[] {
  const offers =
    envelope && typeof envelope === 'object'
      ? (envelope as RawRecruiteeEnvelope).offers
      : null;
  if (!Array.isArray(offers)) return [];
  const out: ProbedListing[] = [];
  for (const o of offers as RawRecruiteeOffer[]) {
    if (out.length >= limit) break;
    const title = String(o?.title ?? '').trim();
    if (!title) continue;
    const locName = composeLocation(o ?? {});
    const deptRaw = o?.department ?? null;
    const deptName = deptRaw ? String(deptRaw).trim() : null;
    out.push({
      id: o?.id ?? '',
      title,
      location: locName || null,
      department: deptName || null,
      updatedAt: toIso(o?.created_at),
    });
  }
  return out;
}

/**
 * Pure gate predicate. Returns a `Survivor` when the board clears the gate,
 * otherwise `null`. Accepts an already-parsed careers-API envelope so it is
 * fully deterministic and unit-testable without network access.
 *
 * The gate is purely count-based: the `offers` array must hold >= `minJobs`
 * title-bearing offers. When it clears, `boardName` is taken from the first
 * offer's `company_name` (informational only).
 */
export function gateBoard(
  slug: string,
  boardPayload: unknown,
  minJobs: number = MIN_JOBS,
): Survivor | null {
  const offers =
    boardPayload && typeof boardPayload === 'object'
      ? (boardPayload as RawRecruiteeEnvelope).offers
      : null;
  const jobCount = Array.isArray(offers) ? offers.length : 0;
  if (jobCount < minJobs) return null;

  // Require the full minJobs of title-bearing rows (defends against a board of
  // placeholder/empty offers), then cap the seed listings at 3 for parity with
  // the Lever/Ashby/SmartRecruiters/Greenhouse probes.
  const titledCount = extractListings(boardPayload, jobCount).length;
  if (titledCount < minJobs) return null;

  const firstCompany =
    Array.isArray(offers) && offers.length ? offers[0]?.company_name : null;
  const boardName = firstCompany ? String(firstCompany).trim() : '';

  const listings = extractListings(boardPayload, 3);
  return { slug, boardName, jobCount, listings };
}

/** Minimal promise-based HTTPS GET → parsed JSON (or null on any failure). */
function getJson(url: string, timeoutMs: number): Promise<unknown> {
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
        if (res.statusCode !== 200) {
          res.resume();
          resolve(null);
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c as Buffer));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch {
            resolve(null);
          }
        });
      },
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

/** Build the public Recruitee careers-API URL for a slug (subdomain host). */
export function boardUrl(slug: string): string {
  return `https://${encodeURIComponent(slug)}.recruitee.com/api/offers`;
}

/** Probe one slug against the public offers endpoint; resolve or `null`. */
export async function probeOne(
  slug: string,
  timeoutMs = 12000,
): Promise<Survivor | null> {
  const board = await getJson(boardUrl(slug), timeoutMs);
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
    `Probing ${slugs.length} Recruitee candidate slug(s) @ concurrency ${PROBE_CONCURRENCY}…`,
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
