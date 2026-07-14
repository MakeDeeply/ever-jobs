/**
 * assemble-recruitee-batch.ts
 *
 * Deterministic descriptor assembler for the **Recruitee** company-source
 * pipeline (Spec 1593). Joins:
 *   - a survivors file (output of `probe-recruitee-company-source.ts`), whose
 *     `slug` field holds the **live Recruitee subdomain identifier** (e.g.
 *     `channable`) and carries `jobCount` + seed `listings`;
 *   - an enrichment file (factual prose: displayName, oneLiner, sector, hq,
 *     description, highlights) keyed by that same subdomain (`companySlug`);
 *   - a starting spec number + phase number (allocated contiguously).
 *
 * …into the `RecruiteeCompanyDescriptor[]` batch JSON consumed by both
 * `scaffold-recruitee-company-source.ts` and `wire-company-source.ts`.
 *
 * The plugin **`slug`** (dir suffix / enum value / id prefix) is DERIVED as a
 * clean, hyphen-free lowercase token from the canonical displayName; the separate
 * **`companySlug`** preserves the exact live subdomain the public API is keyed
 * on. All mechanical identifier fields (className/moduleName/serviceName/enumKey)
 * are derived from the displayName so naming is single-sourced.
 *
 * Collision safety (mirrors the SmartRecruiters run-#443 discipline):
 *   - reject a candidate whose derived `enumKey` starts with a digit (invalid TS
 *     enum member);
 *   - reject a candidate whose derived `slug` or `enumKey` collides with an
 *     existing entry in `packages/models/src/enums/site.enum.ts`;
 *   - reject an in-batch duplicate `slug`/`enumKey`.
 * Rejected candidates are logged and skipped (never silently dropped).
 *
 * Usage (via ts-node / tsx):
 *   tsx scripts/assemble-recruitee-batch.ts \
 *     .rc-survivors.json .rc-enrich.json .rc-batch.json <startSpecNo> <startPhaseNo>
 */
import * as fs from 'fs';
import * as path from 'path';
import type {
  RecruiteeCompanyDescriptor,
  ListingInput,
} from './scaffold-recruitee-company-source';

interface Survivor {
  slug: string; // the live Recruitee subdomain identifier (companySlug)
  boardName: string;
  jobCount: number;
  listings: ListingInput[];
}

interface Enrichment {
  companySlug: string;
  displayName: string;
  oneLiner: string;
  sector: string;
  hq: string;
  description: string;
  highlights: string[];
}

/** "Rocket Lab" → "RocketLab"; "EnergyHub" → "EnergyHub". */
export function pascalBase(displayName: string): string {
  const cleaned = displayName.replace(/[^A-Za-z0-9 ]+/g, ' ');
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words
    .map((w) => (/[a-z]/.test(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join('');
}

/** "Rocket Lab" → "ROCKET_LAB". */
export function enumKeyOf(displayName: string): string {
  const cleaned = displayName.replace(/[^A-Za-z0-9 ]+/g, ' ');
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words.map((w) => w.toUpperCase()).join('_');
}

/** "Rocket Lab" → "rocketlab"; lower-cased, alnum-only, hyphen-free. */
export function slugOf(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^[^a-z]+/, ''); // strip any leading non-letter for a valid token
}

/** Parse the existing Site enum values + keys for collision checking. */
function readEnumTokens(repoRoot: string): { keys: Set<string>; values: Set<string> } {
  const enumPath = path.join(
    repoRoot,
    'packages',
    'models',
    'src',
    'enums',
    'site.enum.ts',
  );
  const src = fs.readFileSync(enumPath, 'utf8');
  const keys = new Set<string>();
  const values = new Set<string>();
  const re = /^\s*([A-Z0-9_]+)\s*=\s*'([^']+)'/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    keys.add(m[1]);
    values.add(m[2]);
  }
  return { keys, values };
}

function main(): void {
  const [survPath, enrichPath, outPath, startSpecRaw, startPhaseRaw] =
    process.argv.slice(2);
  const startSpec = parseInt(startSpecRaw, 10);
  const startPhase = parseInt(startPhaseRaw, 10);
  if (!Number.isFinite(startSpec) || !Number.isFinite(startPhase)) {
    throw new Error('startSpecNo and startPhaseNo must be integers');
  }
  const repoRoot = process.cwd();
  const abs = (p: string) => (path.isAbsolute(p) ? p : path.join(repoRoot, p));

  const survivors: Survivor[] = JSON.parse(fs.readFileSync(abs(survPath), 'utf8'));
  const enrich: Enrichment[] = JSON.parse(fs.readFileSync(abs(enrichPath), 'utf8'));
  const eBySlug = new Map(enrich.map((e) => [e.companySlug, e]));

  const { keys: existingKeys, values: existingValues } = readEnumTokens(repoRoot);
  const batchSlugs = new Set<string>();
  const batchKeys = new Set<string>();

  const batch: RecruiteeCompanyDescriptor[] = [];
  let specNo = startSpec;
  const rejected: string[] = [];

  // Stable ordering for deterministic spec-number allocation.
  survivors.sort((a, b) => a.slug.localeCompare(b.slug));

  for (const s of survivors) {
    const e = eBySlug.get(s.slug);
    if (!e) {
      rejected.push(`${s.slug} — no enrichment`);
      continue;
    }
    const base = pascalBase(e.displayName);
    const enumKey = enumKeyOf(e.displayName);
    const slug = slugOf(e.displayName);

    if (!base || !enumKey || !slug) {
      rejected.push(`${s.slug} — empty derived identifier`);
      continue;
    }
    if (/^[0-9]/.test(enumKey)) {
      rejected.push(`${s.slug} — enumKey '${enumKey}' starts with a digit`);
      continue;
    }
    if (existingValues.has(slug) || batchSlugs.has(slug)) {
      rejected.push(`${s.slug} — slug '${slug}' collides`);
      continue;
    }
    if (existingKeys.has(enumKey) || batchKeys.has(enumKey)) {
      rejected.push(`${s.slug} — enumKey '${enumKey}' collides`);
      continue;
    }

    batchSlugs.add(slug);
    batchKeys.add(enumKey);
    const thisSpec = specNo++;
    batch.push({
      slug,
      companySlug: s.slug,
      className: base,
      moduleName: `${base}Module`,
      serviceName: `${base}Service`,
      enumKey,
      displayName: e.displayName,
      specNo: thisSpec,
      // Recent-batch convention: phaseNo mirrors the plugin's own spec number.
      phaseNo: thisSpec,
      jobCount: s.jobCount,
      oneLiner: e.oneLiner,
      sector: e.sector,
      hq: e.hq,
      description: e.description,
      highlights: e.highlights,
      listings: s.listings.slice(0, 3),
    });
  }

  fs.writeFileSync(abs(outPath), JSON.stringify(batch, null, 2) + '\n');
  // eslint-disable-next-line no-console
  console.log(
    `Assembled ${batch.length} Recruitee descriptors → ${outPath} (Specs ${startSpec}–${specNo - 1})`,
  );
  if (rejected.length) {
    // eslint-disable-next-line no-console
    console.log(`Rejected ${rejected.length}:`);
    for (const r of rejected) {
      // eslint-disable-next-line no-console
      console.log(`  ✗ ${r}`);
    }
  }
}

if (require.main === module) {
  main();
}
