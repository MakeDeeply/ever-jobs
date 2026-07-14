/**
 * process-recruitee-discovery.ts (run helper — Spec 1593 batch, run #444)
 *
 * Reads the Recruitee discovery-workflow output and marshals it into the
 * deterministic probe→assemble→scaffold→wire pipeline. The workflow returns
 * `{ count, companies: [...] }`; the task-runner wraps that under a top-level
 * `result` field (object or stringified JSON). This script accepts any of:
 *   - `{ companies: [...] }`
 *   - `{ result: { companies: [...] } }`
 *   - `{ result: "{ \"companies\": [...] }" }`
 *   - `{ candidates: [...] }`  (legacy SmartRecruiters shape)
 *
 * It decodes HTML entities in the prose fields, optionally merges one or more
 * extra enrichment files (e.g. a hand-written seed list), dedupes by
 * case-insensitive companySlug, and emits:
 *   - <enrichOut>   — enrichment records keyed by companySlug
 *   - <candOut>     — newline-separated companySlugs for the central probe
 *
 * NOT wired into the repo build; used only to marshal discovery output. The
 * temp inputs/outputs live under `tmp/` and are deleted after the run.
 *
 * Usage:
 *   ts-node scripts/process-recruitee-discovery.ts <input.json> <enrichOut> <candOut> [extraEnrich.json ...]
 */
import * as fs from 'fs';

function decodeEntities(s: string): string {
  if (!s) return s;
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#0*[0-9]+;/g, (m) => {
      const code = parseInt(m.replace(/[^0-9]/g, ''), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    });
}

interface RawCandidate {
  companySlug: string;
  displayName: string;
  sector: string;
  hq: string;
  oneLiner: string;
  description: string;
  highlights: string[];
}

interface EnrichRecord {
  companySlug: string;
  displayName: string;
  oneLiner: string;
  sector: string;
  hq: string;
  description: string;
  highlights: string[];
}

/** Pull the candidate array out of any of the accepted wrapper shapes. */
function extractCandidates(raw: string): RawCandidate[] {
  let parsed: any = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed as RawCandidate[];
  // Unwrap a task-runner `result` (object or stringified JSON).
  if (!parsed.companies && !parsed.candidates && parsed.result !== undefined) {
    parsed =
      typeof parsed.result === 'string' ? JSON.parse(parsed.result) : parsed.result;
  }
  return (parsed.companies || parsed.candidates || []) as RawCandidate[];
}

function main(): void {
  const [inputPath, enrichOut, candOut, ...extra] = process.argv.slice(2);
  const candidates = extractCandidates(fs.readFileSync(inputPath, 'utf8'));

  const seen = new Set<string>();
  const enrich: EnrichRecord[] = [];
  const slugs: string[] = [];

  const push = (c: RawCandidate): void => {
    if (!c || !c.companySlug || !c.displayName) return;
    const key = String(c.companySlug).trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    enrich.push({
      companySlug: key,
      displayName: decodeEntities(c.displayName).trim(),
      oneLiner: decodeEntities(c.oneLiner || '').trim(),
      sector: decodeEntities(c.sector || '').trim(),
      hq: decodeEntities(c.hq || '').trim(),
      description: decodeEntities(c.description || '').trim(),
      highlights: (c.highlights || []).map((h) => decodeEntities(h).trim()).filter(Boolean),
    });
    slugs.push(key);
  };

  for (const c of candidates) push(c);
  // Merge any extra hand-written enrichment files (seed survivors, etc.).
  for (const p of extra) {
    const rows: RawCandidate[] = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const c of rows) push(c);
  }

  fs.writeFileSync(enrichOut, JSON.stringify(enrich, null, 2) + '\n');
  fs.writeFileSync(candOut, slugs.join('\n') + '\n');
  // eslint-disable-next-line no-console
  console.log(
    `Processed ${enrich.length} unique candidates → ${enrichOut} + ${candOut}`,
  );
}

main();
