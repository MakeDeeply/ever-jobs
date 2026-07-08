/**
 * Constants for the CaneKast (canekast.com) careers scraper.
 *
 * CaneKast has no third-party ATS. Its careers page is a hand-authored
 * WordPress/Elementor page that lists each open role as a heading linking to a
 * per-role PDF job description under `/wp-content/uploads/`. Applications go
 * through a single shared on-page form (no per-role apply URL, no email). The
 * page is server-rendered plain HTML, so the listing is fetched over HTTP and
 * parsed with Cheerio; the PDFs are unauthenticated and fetched over HTTP too.
 *
 * This is a single-company plugin: the domain, careers URL, and company name
 * are baked in. The transport (HTML listing + PDF descriptions) is bespoke to
 * this site, so there is no shared contract to parameterize by an id.
 */

/** Canonical company display name. */
export const CANEKAST_COMPANY_NAME = 'CaneKast';

/** Site origin. */
export const CANEKAST_ORIGIN = 'https://canekast.com';

/** Public careers page (companyUrl, listing fetch target, and shared apply form). */
export const CANEKAST_CAREERS_URL = `${CANEKAST_ORIGIN}/careers/`;

/** Default number of roles returned when the caller does not specify. */
export const CANEKAST_DEFAULT_RESULTS = 50;

/** Default per-request timeout (seconds). */
export const CANEKAST_DEFAULT_TIMEOUT_SECONDS = 30;

/** Matches PDF links to per-role job descriptions in the WordPress media library. */
export const CANEKAST_PDF_HREF_RE = /\/wp-content\/uploads\/[^"'\s]+\.pdf(?:[?#]|$)/i;

/**
 * Factory for the letterhead matcher. Each PDF opens (and repeats before the
 * Qualifications block) with the company mailing address, e.g.
 * `840 Arbor Drive Chaska, MN 55318 Phone 952-448-2801`. The lazy street run
 * plus a single-token city before the `, ST ZIP` isolates the city so it can be
 * used as the role location; the full match (address + optional phone) is
 * stripped from the description body. A factory returns a fresh regex so the
 * global `lastIndex` is never shared between the location read and the strip.
 */
export const canekastLetterheadRe = (): RegExp =>
  /\d{1,6}\s+[A-Za-z0-9 .'-]+?\s+([A-Za-z.'-]+),\s*([A-Z]{2})\s+\d{5}(?:\s*Phone\s*[\d().+\-\s]{7,16})?/g;
