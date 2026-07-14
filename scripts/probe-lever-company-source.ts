/**
 * probe-lever-company-source.ts
 *
 * Reusable, deterministic **discovery** helper for **Lever-backed**
 * company-direct source candidates. Given a newline-separated candidate-slug
 * file, it concurrently probes each slug against the public Lever Postings API
 * and emits a survivors JSON whose shape feeds directly into the
 * descriptor-assembly step of the Lever company-source pipeline:
 *
 *   - Job board (public, zero-auth):
 *       https://api.lever.co/v0/postings/<slug>?mode=json
 *
 * Like Ashby (and unlike Greenhouse), the public Lever Postings API returns a
 * **bare JSON array** of postings with **no board display name** — so there is
 * no board-name brand-match anchor to gate on. A candidate therefore SURVIVES
 * the gate iff:
 *   (a) the endpoint returns HTTP 200 with a JSON array, AND
 *   (b) that array holds >= MIN_JOBS live postings, each carrying a `text`
 *       (title).
 *
 * Brand-match is enforced downstream at descriptor-assembly time (the verified
 * `displayName` + `companySlug` pair), NOT from the wire — same rationale as
 * the Ashby probe (`docs/questions.md` Q-ASHBY-1 / Q-LEVER-1).
 *
 * Network I/O is isolated in `probeOne`; the gate + listing-extraction logic is
 * factored into the pure, unit-tested helpers `gateBoard` and `extractListings`
 * so the decision surface can be exercised without hitting the live host.
 *
 * Usage (via ts-node):
 *   ts-node --project tsconfig.base.json -r tsconfig-paths/register \
 *     scripts/probe-lever-company-source.ts .candidates.txt .survivors.json
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
   * Lever's public API omits a board display name; kept in the shape for
   * parity with the Greenhouse survivor (and any future authenticated probe),
   * populated `''` here so downstream assembly reads the verified descriptor
   * `displayName` instead of the wire.
   */
  boardName: string;
  jobCount: number;
  listings: ProbedListing[];
}

/** Raw shape of a Lever public `postings` entry (only fields we read). */
interface RawLeverJob {
  id?: number | string;
  /** Lever carries the job title in `text`. */
  text?: string;
  categories?: {
    location?: string | null;
    allLocations?: string[] | null;
    department?: string | null;
    team?: string | null;
  } | null;
  /** Epoch-millis creation timestamp. */
  createdAt?: number | null;
}

/**
 * Pure listing extractor: normalise the first `limit` raw Lever postings into
 * the `ProbedListing` shape consumed downstream. Defensive against missing
 * fields; trims string values so padded wire data never leaks through. Prefers
 * the multi-site `categories.allLocations[0]`, falling back to
 * `categories.location`.
 */
export function extractListings(
  rawJobs: unknown,
  limit: number,
): ProbedListing[] {
  if (!Array.isArray(rawJobs)) return [];
  const out: ProbedListing[] = [];
  for (const j of rawJobs as RawLeverJob[]) {
    if (out.length >= limit) break;
    const title = String(j?.text ?? '').trim();
    if (!title) continue;
    const cats = j?.categories ?? null;
    const locRaw =
      (Array.isArray(cats?.allLocations) && cats?.allLocations?.length
        ? cats?.allLocations[0]
        : cats?.location) ?? null;
    const locName = locRaw ? String(locRaw).trim() : null;
    const deptRaw = cats?.department ?? cats?.team ?? null;
    const deptName = deptRaw ? String(deptRaw).trim() : null;
    const created =
      typeof j?.createdAt === 'number' && Number.isFinite(j.createdAt)
        ? new Date(j.createdAt).toISOString()
        : null;
    out.push({
      id: j?.id ?? '',
      title,
      location: locName || null,
      department: deptName || null,
      updatedAt: created,
    });
  }
  return out;
}

/**
 * Pure gate predicate. Returns a `Survivor` when the board clears the gate,
 * otherwise `null`. Accepts an already-parsed postings payload so it is fully
 * deterministic and unit-testable without network access.
 *
 * Lever has no board-name anchor, so the gate is purely count-based: the
 * payload must be an array of >= `minJobs` title-bearing postings.
 */
export function gateBoard(
  slug: string,
  boardPayload: unknown,
  minJobs: number = MIN_JOBS,
): Survivor | null {
  const rawJobs = boardPayload;
  const jobCount = Array.isArray(rawJobs) ? rawJobs.length : 0;
  if (jobCount < minJobs) return null;

  // Require the full minJobs of title-bearing rows (defends against a board of
  // placeholder/empty postings), then cap the seed listings at 3 for parity
  // with the Ashby/Greenhouse probes.
  const titledCount = extractListings(rawJobs, jobCount).length;
  if (titledCount < minJobs) return null;

  const listings = extractListings(rawJobs, 3);
  return { slug, boardName: '', jobCount, listings };
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

const BOARD_BASE = 'https://api.lever.co/v0/postings';

/** Probe one slug against the public postings endpoint; resolve or `null`. */
export async function probeOne(
  slug: string,
  timeoutMs = 12000,
): Promise<Survivor | null> {
  const board = await getJson(
    `${BOARD_BASE}/${encodeURIComponent(slug)}?mode=json`,
    timeoutMs,
  );
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
    `Probing ${slugs.length} Lever candidate slug(s) @ concurrency ${PROBE_CONCURRENCY}…`,
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
