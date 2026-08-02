import { CompensationInterval } from '@ever-jobs/models';

/**
 * Constants for the Desktop Metal (desktopmetal.com) careers scraper.
 *
 * Desktop Metal has no third-party ATS. Its careers page is a hand-authored
 * listing that groups open roles under department headings; each role links to
 * a per-role PDF job description under `/uploads/`, and applications are sent to
 * a single global email. The listing page sits behind a Cloudflare managed
 * challenge and is client-rendered, so it is fetched with a headless (stealth)
 * browser; the PDFs themselves are unauthenticated and fetched over plain HTTP.
 *
 * This is a single-company plugin: the domain, careers URL, and company name
 * are baked in. The transport (HTML listing + PDF descriptions) is bespoke to
 * this site, so there is no shared contract to parameterize by an id.
 */

/** Canonical company display name (the careers brand, not the legal entity). */
export const DESKTOPMETAL_COMPANY_NAME = 'Desktop Metal';

/** Site origin — the `www` host is the one Cloudflare serves. */
export const DESKTOPMETAL_ORIGIN = 'https://www.desktopmetal.com';

/** Public careers page (used as companyUrl and as the listing fetch target). */
export const DESKTOPMETAL_CAREERS_URL = `${DESKTOPMETAL_ORIGIN}/careers`;

/** Default number of roles returned when the caller does not specify. */
export const DESKTOPMETAL_DEFAULT_RESULTS = 50;

/** Default per-request timeout (seconds). */
export const DESKTOPMETAL_DEFAULT_TIMEOUT_SECONDS = 30;

/** Bounded concurrency for the per-role PDF fetches. */
export const DESKTOPMETAL_PDF_CONCURRENCY = 4;

/**
 * Per-unit pay tokens that may appear in a role's PDF, mapped to the canonical
 * interval. Ordered most-specific first; the first match wins. Used only as a
 * fallback when the explicit "Salary Range" / "Hourly Range" label is absent.
 */
export const DESKTOPMETAL_PAY_INTERVALS: ReadonlyArray<
  readonly [RegExp, CompensationInterval]
> = [
  [/(?:\/\s*(?:hr|hrs|hour)|per\s+hour|hourly)\b/i, CompensationInterval.HOURLY],
  [/(?:\/\s*day|per\s+day|daily)\b/i, CompensationInterval.DAILY],
  [/(?:\/\s*(?:wk|week)|per\s+week|weekly)\b/i, CompensationInterval.WEEKLY],
  [/(?:\/\s*(?:mo|month)|per\s+month|monthly)\b/i, CompensationInterval.MONTHLY],
  [
    /(?:\/\s*(?:yr|year)|per\s+(?:year|annum)|yearly|annually)\b/i,
    CompensationInterval.YEARLY,
  ],
];
