import { createHash } from 'crypto';
import { normalizeCompany, normalizeLocation, normalizeTitle } from './normalize';

/**
 * Triple of normalised fields that, joined with `|`, defines the canonical
 * identity of a job posting (Spec 003).
 */
export interface CanonicalKeyInput {
  readonly title: string | null | undefined;
  readonly company: string | null | undefined;
  readonly location: string | null | undefined;
  /**
   * Per-site locations when the source carries them (Spec 5123). When
   * non-empty, the location component of the key is built from the sorted
   * set of normalised `city|state|country` triples — the richest site data
   * available — instead of the flattened `location` string. The string is
   * the fallback for sources without per-site data.
   */
  readonly locations?:
    | ReadonlyArray<{
        city?: string | null;
        state?: string | null;
        country?: string | null;
      }>
    | null;
}

/**
 * Location component of the canonical key.
 *
 * With `locations[]`: each site contributes `normalizeLocation("city, state,
 * country")`; empty triples are dropped; the surviving set is sorted and
 * joined with `;` so site ordering and label punctuation never change the
 * identity of a posting. When no site yields a triple, the flattened
 * `location` string is the fallback — keeping mixed batches (rows with and
 * without `locations[]`) mergeable.
 */
function locationKeyComponent(
  location: string | null | undefined,
  locations: CanonicalKeyInput['locations'],
): string {
  if (locations && locations.length > 0) {
    const triples = new Set<string>();
    for (const site of locations) {
      const triple = normalizeLocation(
        [site.city, site.state, site.country].filter(Boolean).join(', '),
      );
      if (triple) triples.add(triple);
    }
    if (triples.size > 0) return Array.from(triples).sort().join(';');
  }
  return normalizeLocation(location ?? '');
}

/**
 * Build the canonical-key string for a raw job. Pure & deterministic.
 *
 *   canonicalKey({ company: "Acme, Inc.", title: "Sr. SWE", location: "Remote" })
 *   //=> "acme|senior swe|remote"
 *
 * The pipe is a literal separator; pipes inside any normalised field are
 * impossible (`PUNCT_RE` doesn't strip pipes for titles, but `TITLE_NOISE`
 * already replaces them with spaces — so pipes can never appear inside a
 * normalised title; companies and locations never contain pipes).
 */
export function canonicalKey(input: CanonicalKeyInput): string {
  const company = normalizeCompany(input.company ?? '');
  const title = normalizeTitle(input.title ?? '');
  const location = locationKeyComponent(input.location, input.locations);
  return `${company}|${title}|${location}`;
}

/**
 * Stable sha-256 (lower-case hex) of the canonical key. This is the
 * `CanonicalJob.canonicalJobId` produced by the dedup engine.
 */
export function canonicalJobId(input: CanonicalKeyInput): string {
  return createHash('sha256').update(canonicalKey(input), 'utf8').digest('hex');
}
