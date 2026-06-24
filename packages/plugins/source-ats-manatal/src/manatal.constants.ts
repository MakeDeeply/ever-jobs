/**
 * Manatal career-page URLs.
 *
 * Spec 5021 — Manatal hosts its public career pages on the white-label domain
 * `careers-page.com`. The legacy `api.manatal.com/open/v1/career-page/{slug}`
 * endpoint now serves the SPA HTML shell (not JSON) for these slugs, so it is
 * dead for harvesting. The working data layer is the careers-page.com JSON API,
 * which the Vue front-end itself consumes:
 *   list:   GET {API}/c/{slug}/jobs/[?page=N]
 *   detail: GET {API}/c/{slug}/jobs/{id}/
 * The list response is self-contained (full HTML description, structured
 * location, and salary fields when visible), so no per-job detail fetch is
 * required.
 */

/** careers-page.com JSON API root. */
export const MANATAL_API_BASE = 'https://www.careers-page.com/api/v1.0';

/** Human-facing careers-page.com host root (used for companyUrl / jobUrl). */
export const MANATAL_SITE_BASE = 'https://www.careers-page.com';

/** Paginated list of a client's jobs. `page` is 1-based; omitted for page 1. */
export function manatalListUrl(slug: string, page?: number): string {
  const base = `${MANATAL_API_BASE}/c/${encodeURIComponent(slug)}/jobs/`;
  return page && page > 1 ? `${base}?page=${page}` : base;
}

/** Public, searchable listing page for a client (the careers-page.com board). */
export function manatalCompanyUrl(slug: string): string {
  return `${MANATAL_SITE_BASE}/${encodeURIComponent(slug)}`;
}

/** Public per-job page; `hash` is the job's short alphanumeric code. */
export function manatalJobUrl(slug: string, hash: string): string {
  return `${MANATAL_SITE_BASE}/${encodeURIComponent(slug)}/job/${encodeURIComponent(hash)}`;
}

/**
 * Hard cap on list pages followed, as a safety valve against a runaway
 * `next` chain. 50 pages × 10 jobs covers 500 postings — far above any
 * realistic single-company board and `resultsWanted` default.
 */
export const MANATAL_MAX_PAGES = 50;

/** The careers-page.com API returns JSON. */
export const MANATAL_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36',
};
