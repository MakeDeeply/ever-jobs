/**
 * process-sr-discovery.ts (ephemeral run helper — Spec 1375 batch, run #443)
 *
 * Reads the SmartRecruiters discovery-workflow output (JSON `{ candidates: [] }`),
 * decodes HTML entities in the prose fields, dedupes by case-insensitive
 * companySlug, and emits:
 *   - .sr-enrich.json   — enrichment records keyed by companySlug
 *   - .sr-candidates.txt — newline-separated companySlugs for the central probe
 *
 * NOT wired into the repo build; used only to marshal the discovery output into
 * the deterministic probe→assemble→scaffold→wire pipeline. Deleted after the run.
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
  verifiedJobCount?: number;
}

function main(): void {
  const [inputPath, enrichOut, candOut] = process.argv.slice(2);
  const raw = fs.readFileSync(inputPath, 'utf8');
  let parsed = JSON.parse(raw) as { candidates?: RawCandidate[]; result?: unknown };
  // The task-runner wraps the workflow return in { summary, result, ... } where
  // `result` is either the object itself or a stringified JSON of it.
  if (!parsed.candidates && parsed.result !== undefined) {
    parsed =
      typeof parsed.result === 'string'
        ? (JSON.parse(parsed.result) as { candidates: RawCandidate[] })
        : (parsed.result as { candidates: RawCandidate[] });
  }
  const seen = new Set<string>();
  const enrich: Array<{
    companySlug: string;
    displayName: string;
    oneLiner: string;
    sector: string;
    hq: string;
    description: string;
    highlights: string[];
  }> = [];
  const slugs: string[] = [];

  for (const c of parsed.candidates || []) {
    if (!c || !c.companySlug || !c.displayName) continue;
    const key = c.companySlug.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    enrich.push({
      companySlug: c.companySlug,
      displayName: decodeEntities(c.displayName).trim(),
      oneLiner: decodeEntities(c.oneLiner || '').trim(),
      sector: decodeEntities(c.sector || '').trim(),
      hq: decodeEntities(c.hq || '').trim(),
      description: decodeEntities(c.description || '').trim(),
      highlights: (c.highlights || []).map((h) => decodeEntities(h).trim()).filter(Boolean),
    });
    slugs.push(c.companySlug);
  }

  fs.writeFileSync(enrichOut, JSON.stringify(enrich, null, 2) + '\n');
  fs.writeFileSync(candOut, slugs.join('\n') + '\n');
  // eslint-disable-next-line no-console
  console.log(`Processed ${enrich.length} unique candidates → ${enrichOut} + ${candOut}`);
}

main();
