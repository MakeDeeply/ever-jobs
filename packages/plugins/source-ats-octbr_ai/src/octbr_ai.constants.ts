/**
 * Constants for the Octbr (octbr.ai) careers-board scraper.
 *
 * Octbr is a multi-tenant ATS: every customer gets a `<slug>.octbr.ai`
 * Laravel + Inertia app. The landing page server-renders an Inertia
 * `data-page` JSON prop on the root div; `props.jobsByDepartment` lists every
 * open role (`{id, title, slug, url, location, location_type,
 * employment_type, ...}`) plus `props.organisation.name` and
 * `props.totalJobs`. Each `job.url` is another Inertia page whose `props.job`
 * carries the full `description` / `responsibilities` / `requirements` HTML
 * and an absolute `posted_date`.
 *
 * So the scraper is a plain HTTP read (no headless browser):
 *   1. GET the tenant root — enumerate roles + company name.
 *   2. GET each `job.url` — extract the description fields.
 *
 * The advertised `/feeds/jobs.json` feed returns an HTML error page on the
 * observed tenant, so it is not used.
 */

export const OCTBR_AI_HOST = 'octbr.ai';

export const OCTBR_AI_DEFAULT_TIMEOUT_SECONDS = 30;

/** `data-page="…"` attribute value on the Inertia root div. */
export const OCTBR_AI_DATA_PAGE_RE = /data-page="([\s\S]*?)"/;
