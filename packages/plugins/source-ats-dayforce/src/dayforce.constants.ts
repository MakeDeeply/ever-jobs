/**
 * Constants for the Ceridian Dayforce HCM candidate career portal platform.
 *
 * Dayforce hosts the public careers sites of many mid-to-large enterprises.
 * The modern candidate portal exposes a "geo search" JSON endpoint shared across
 * every tenant:
 *
 *   POST https://jobs.dayforcehcm.com/api/geo/{client}/jobposting/search
 *     body → { clientNamespace, jobBoardCode, cultureCode, distanceUnit, paginationStart }
 *     → { jobPostings: [...], maxCount: <total>, count: <page len> }
 *
 * The legacy per-tenant portal lives at `https://{client}.dayforcehcm.com/CandidatePortal/`
 * with job detail views at `/CandidatePortal/en-US/{client}/Posting/View/{id}`; we keep
 * the detail-URL shape here so we can synthesize a viewable link when the feed omits one.
 *
 * The geo search endpoint now requires a CSRF token and session cookie. `DayforceService`
 * bootstraps a session by first calling `GET /api/auth/csrf` with the candidate-portal
 * page as the `Referer`; the response sets `__Host-next-auth.csrf-token` and returns the
 * token to send as `X-CSRF-TOKEN` on every search POST.
 */

/**
 * Shared public candidate-portal host. Every tenant's jobs are served from the
 * same host; the tenant is selected via the `{client}` path segment / namespace.
 */
export const DAYFORCE_HOST = 'https://jobs.dayforcehcm.com';

/** Per-tenant legacy portal host template; `{client}` is substituted at runtime. */
export const DAYFORCE_TENANT_HOST_TEMPLATE = 'https://{client}.dayforcehcm.com';

/** Public geo job-posting search endpoint path; `{client}` is substituted at runtime. */
export const DAYFORCE_SEARCH_PATH = '/api/geo/{client}/jobposting/search';

/** CSRF token endpoint. Called before the first search to obtain `X-CSRF-TOKEN`. */
export const DAYFORCE_CSRF_PATH = '/api/auth/csrf';

/** Candidate portal page path template; used as the `Referer` for the CSRF handshake. */
export const DAYFORCE_PORTAL_PATH_TEMPLATE = '/en-US/{client}/CANDIDATEPORTAL';

/** Default candidate job-board code. CANDIDATEPORTAL is the standard public board. */
export const DAYFORCE_JOB_BOARD_CODE = 'CANDIDATEPORTAL';

/** Default culture (locale) code used for the feed and detail URLs. */
export const DAYFORCE_CULTURE_CODE = 'en-US';

/**
 * Server-fixed page size. The geo search endpoint returns up to 25 postings per
 * request regardless of any requested size; pagination is via `paginationStart`.
 */
export const DAYFORCE_PAGE_SIZE = 25;

/** Maximum number of search pages to fetch concurrently per tenant. */
export const DAYFORCE_MAX_CONCURRENCY = 6;

/** Delay (ms) between sequential pagination rounds, to stay polite. */
export const DAYFORCE_REQUEST_DELAY_MS = 300;

/** Default request headers. Dayforce expects a browser-like UA + JSON accept. */
export const DAYFORCE_HEADERS: Record<string, string> = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};
