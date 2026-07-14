/**
 * probe-ashby-company-source.ts
 *
 * Reusable, deterministic **discovery** helper for **Ashby-backed**
 * company-direct source candidates. Given a newline-separated candidate-slug
 * file, it concurrently probes each slug against the public Ashby Posting API
 * and emits a survivors JSON whose shape feeds directly into the
 * descriptor-assembly step of the Ashby company-source pipeline:
 *
 *   - Job board (public, zero-auth):
 *       https://api.ashbyhq.com/posting-api/job-board/<slug>
 *
 * Unlike Greenhouse, the public Ashby Posting API does **not** expose a board
 * display name (only `{ apiVersion, jobs[] }`), so there is no board-name
 * brand-match anchor to gate on. A candidate therefore SURVIVES the gate iff:
 *   (a) the endpoint returns HTTP 200 with a `jobs` array, AND
 *   (b) that array holds >= MIN_JOBS live listings, each carrying a title.
 *
 * Brand-match is enforced downstream at descriptor-assembly time (the verified
 * `displayName` + `companySlug` pair), NOT from the wire — see
 * `docs/questions.md` Q-ASHBY-1 for the rationale.
 *
 * Network I/O is isolated in `probeOne`; the gate + listing-extraction logic is
 * factored into the pure, unit-tested helpers `gateBoard` and `extractListings`
 * so the decision surface can be exercised without hitting the live host.
 *
 * Usage (via ts-node):
 *   ts-node --project tsconfig.base.json -r tsconfig-paths/register \
 *     scripts/probe-ashby-company-source.ts .candidates.txt .survivors.json
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
   * Ashby's public API omits a board display name; kept in the shape for
   * parity with the Greenhouse survivor (and any future authenticated probe),
   * populated `''` here so downstream assembly reads the verified descriptor
   * `displayName` instead of the wire.
   */
  boardName: string;
  jobCount: number;
  listings: ProbedListing[];
}

/** Raw shape of an Ashby public `job-board` listing (only fields we read). */
interface RawAshbyJob {
  id?: number | string;
  title?: string;
  /** Public API serves a flat string location, e.g. "Austin, TX". */
  location?: string | null;
  /** Public API field name; authenticated Posting API uses `department`. */
  departmentName?: string | null;
  department?: string | null;
  /** Public API field name; authenticated Posting API uses `publishedAt`. */
  publishedDate?: string | null;
  publishedAt?: string | null;
}

/**
 * Pure listing extractor: normalise the first `limit` raw Ashby jobs into the
 * `ProbedListing` shape consumed downstream. Defensive against missing fields;
 * trims string values so padded wire data never leaks through. Tolerates both
 * the public (`departmentName`/`publishedDate`) and authenticated
 * (`department`/`publishedAt`) field names.
 */
export function extractListings(
  rawJobs: unknown,
  limit: number,
): ProbedListing[] {
  if (!Array.isArray(rawJobs)) return [];
  const out: ProbedListing[] = [];
  for (const j of rawJobs as RawAshbyJob[]) {
    if (out.length >= limit) break;
    const title = String(j?.title ?? '').trim();
    if (!title) continue;
    const locName = j?.location ? String(j.location).trim() : null;
    const deptRaw = j?.departmentName ?? j?.department ?? null;
    const deptName = deptRaw ? String(deptRaw).trim() : null;
    const updatedRaw = j?.publishedAt ?? j?.publishedDate ?? null;
    out.push({
      id: j?.id ?? '',
      title,
      location: locName || null,
      department: deptName || null,
      updatedAt: updatedRaw ? String(updatedRaw) : null,
    });
  }
  return out;
}

/**
 * Pure gate predicate. Returns a `Survivor` when the board clears the gate,
 * otherwise `null`. Accepts an already-parsed job-board payload so it is fully
 * deterministic and unit-testable without network access.
 *
 * Ashby has no board-name anchor, so the gate is purely count-based: the
 * payload must expose a `jobs` array of >= `minJobs` title-bearing listings.
 */
export function gateBoard(
  slug: string,
  boardPayload: unknown,
  minJobs: number = MIN_JOBS,
): Survivor | null {
  const rawJobs = (boardPayload as { jobs?: unknown } | null)?.jobs;
  const jobCount = Array.isArray(rawJobs) ? rawJobs.length : 0;
  if (jobCount < minJobs) return null;

  // Extract enough listings to (a) confirm >= minJobs carry real titles and
  // (b) seed the downstream fixture. Cap the seed at 3 for parity with the
  // Greenhouse probe, but require the full minJobs of title-bearing rows.
  const titledCount = extractListings(rawJobs, jobCount).length;
  if (titledCount < minJobs) return null;

  const listings = extractListings(rawJobs, 3);
  return { slug, boardName: '', jobCount, listings };
}

/** Minimal promise-based HTTPS GET → parsed JSON (or null on any failure). */
function getJson(url: string, timeoutMs: number): Promise<unknown> {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: timeoutMs }, (res) => {
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
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

const BOARD_BASE = 'https://api.ashbyhq.com/posting-api/job-board';

/** Probe one slug against the public job-board endpoint; resolve or `null`. */
export async function probeOne(
  slug: string,
  timeoutMs = 12000,
): Promise<Survivor | null> {
  const board = await getJson(`${BOARD_BASE}/${encodeURIComponent(slug)}`, timeoutMs);
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
  console.log(`Probing ${slugs.length} Ashby candidate slug(s) @ concurrency ${PROBE_CONCURRENCY}…`);
  const survivors = await probeAll(slugs);
  fs.writeFileSync(sAbs, JSON.stringify(survivors, null, 2) + '\n');
  // eslint-disable-next-line no-console
  console.log(`\nDone. ${survivors.length}/${slugs.length} survived → ${survivorsPath}`);
}

if (require.main === module) {
  void main();
}
