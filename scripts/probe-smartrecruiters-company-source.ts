/**
 * probe-smartrecruiters-company-source.ts
 *
 * Reusable, deterministic **discovery** helper for **SmartRecruiters-backed**
 * company-direct source candidates. Given a newline-separated candidate-slug
 * file, it concurrently probes each slug against the public SmartRecruiters
 * Posting API and emits a survivors JSON whose shape feeds directly into the
 * descriptor-assembly step of the SmartRecruiters company-source pipeline:
 *
 *   - Job board (public, zero-auth):
 *       https://api.smartrecruiters.com/v1/companies/<slug>/postings?limit=100
 *
 * Unlike Lever and Ashby (bare JSON arrays), the public SmartRecruiters Posting
 * API returns a **JSON envelope** `{ offset, limit, totalFound, content: [...] }`.
 * Each posting in `content` additionally carries `company.name`, so — unlike
 * the Lever/Ashby probes — a board display name IS available on the wire and is
 * captured into `boardName` for informational parity with the Greenhouse probe.
 * The gate itself stays purely count-based (no brand-match on the wire): a
 * candidate SURVIVES iff
 *   (a) the endpoint returns HTTP 200 with a `content` array, AND
 *   (b) that array holds >= MIN_JOBS live postings, each carrying a `name`
 *       (title).
 *
 * Brand-match is enforced downstream at descriptor-assembly time (the verified
 * `displayName` + `companySlug` pair), NOT from the wire — same rationale as the
 * Ashby / Lever probes (`docs/questions.md` Q-ASHBY-1 / Q-LEVER-1 / Q-SR-1).
 *
 * Network I/O is isolated in `probeOne`; the gate + listing-extraction logic is
 * factored into the pure, unit-tested helpers `gateBoard` and `extractListings`
 * so the decision surface can be exercised without hitting the live host.
 *
 * Usage (via ts-node):
 *   ts-node --project tsconfig.base.json -r tsconfig-paths/register \
 *     scripts/probe-smartrecruiters-company-source.ts .candidates.txt .survivors.json
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
   * SmartRecruiters exposes `company.name` on each posting, so — unlike the
   * Lever/Ashby survivors — a real board display name is captured here (falls
   * back to `''` when absent). Downstream assembly still prefers the verified
   * descriptor `displayName`; this is informational.
   */
  boardName: string;
  jobCount: number;
  listings: ProbedListing[];
}

/** Raw shape of a SmartRecruiters public posting (only fields we read). */
interface RawSmartRecruitersJob {
  id?: number | string;
  /** SmartRecruiters carries the job title in `name`. */
  name?: string;
  location?: {
    city?: string | null;
    region?: string | null;
    country?: string | null;
    remote?: boolean | null;
    fullLocation?: string | null;
  } | null;
  department?: { label?: string | null } | null;
  function?: { label?: string | null } | null;
  company?: { name?: string | null; identifier?: string | null } | null;
  /** ISO-8601 release timestamp. */
  releasedDate?: string | null;
}

/** Raw shape of the public SmartRecruiters Posting API envelope. */
interface RawSmartRecruitersEnvelope {
  content?: RawSmartRecruitersJob[] | null;
  totalFound?: number | null;
}

/**
 * Compose a human-readable location string from the structured SmartRecruiters
 * location object. Prefers `fullLocation`, else joins city/region/country, else
 * flags remote.
 */
function composeLocation(
  loc: RawSmartRecruitersJob['location'],
): string | null {
  if (!loc) return null;
  const full = loc.fullLocation ? String(loc.fullLocation).trim() : '';
  if (full) return full;
  const parts = [loc.city, loc.region, loc.country]
    .map((p) => (p ? String(p).trim() : ''))
    .filter(Boolean);
  if (parts.length) return parts.join(', ');
  if (loc.remote) return 'Remote';
  return null;
}

/**
 * Pure listing extractor: normalise the first `limit` raw SmartRecruiters
 * postings into the `ProbedListing` shape consumed downstream. Defensive against
 * missing fields; trims string values so padded wire data never leaks through.
 * Reads the `content` array off the envelope.
 */
export function extractListings(
  envelope: unknown,
  limit: number,
): ProbedListing[] {
  const content =
    envelope && typeof envelope === 'object'
      ? (envelope as RawSmartRecruitersEnvelope).content
      : null;
  if (!Array.isArray(content)) return [];
  const out: ProbedListing[] = [];
  for (const j of content as RawSmartRecruitersJob[]) {
    if (out.length >= limit) break;
    const title = String(j?.name ?? '').trim();
    if (!title) continue;
    const locName = composeLocation(j?.location ?? null);
    const deptRaw = j?.department?.label ?? j?.function?.label ?? null;
    const deptName = deptRaw ? String(deptRaw).trim() : null;
    const released =
      typeof j?.releasedDate === 'string' && j.releasedDate
        ? new Date(j.releasedDate).toISOString()
        : null;
    out.push({
      id: j?.id ?? '',
      title,
      location: locName || null,
      department: deptName || null,
      updatedAt: released,
    });
  }
  return out;
}

/**
 * Pure gate predicate. Returns a `Survivor` when the board clears the gate,
 * otherwise `null`. Accepts an already-parsed posting-API envelope so it is
 * fully deterministic and unit-testable without network access.
 *
 * The gate is purely count-based: the `content` array must hold >= `minJobs`
 * title-bearing postings. When it clears, `boardName` is taken from the first
 * posting's `company.name` (informational only).
 */
export function gateBoard(
  slug: string,
  boardPayload: unknown,
  minJobs: number = MIN_JOBS,
): Survivor | null {
  const content =
    boardPayload && typeof boardPayload === 'object'
      ? (boardPayload as RawSmartRecruitersEnvelope).content
      : null;
  const jobCount = Array.isArray(content) ? content.length : 0;
  if (jobCount < minJobs) return null;

  // Require the full minJobs of title-bearing rows (defends against a board of
  // placeholder/empty postings), then cap the seed listings at 3 for parity
  // with the Lever/Ashby/Greenhouse probes.
  const titledCount = extractListings(boardPayload, jobCount).length;
  if (titledCount < minJobs) return null;

  const firstCompany =
    Array.isArray(content) && content.length
      ? content[0]?.company?.name
      : null;
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

const BOARD_BASE = 'https://api.smartrecruiters.com/v1/companies';

/** Probe one slug against the public postings endpoint; resolve or `null`. */
export async function probeOne(
  slug: string,
  timeoutMs = 12000,
): Promise<Survivor | null> {
  const board = await getJson(
    `${BOARD_BASE}/${encodeURIComponent(slug)}/postings?limit=100`,
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
    `Probing ${slugs.length} SmartRecruiters candidate slug(s) @ concurrency ${PROBE_CONCURRENCY}…`,
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
