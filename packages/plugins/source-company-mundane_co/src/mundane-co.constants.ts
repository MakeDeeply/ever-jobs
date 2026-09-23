export const MUNDANE_COMPANY_NAME = 'Mundane';
export const MUNDANE_ORIGIN = 'https://mundane.co';
export const MUNDANE_JOIN_URL = `${MUNDANE_ORIGIN}/join-us`;
export const MUNDANE_DEFAULT_TIMEOUT_SECONDS = 30;
/** Let the Airtable shared form hydrate before reading the DOM. */
export const MUNDANE_AIRTABLE_HYDRATE_MS = 2500;
/** Cap on per-job Airtable renders so a large board stays bounded. */
export const MUNDANE_MAX_DETAIL_RENDERS = 25;
/**
 * Job entries embedded in the site bundle look like
 * `{title:"…",category:"…",location:"…",url:"…"}`; the array identifier is
 * minified per deploy, so entries are matched by field shape and an
 * apply-URL host (Airtable shared forms or LinkedIn job posts).
 */
export const MUNDANE_JOB_ENTRY_RE =
  /\{title:"((?:[^"\\]|\\.)*)",category:"((?:[^"\\]|\\.)*)",location:"((?:[^"\\]|\\.)*)",url:"((?:[^"\\]|\\.)*)"\}/g;
export const MUNDANE_APPLY_HOST_RE = /(?:airtable\.com|linkedin\.com)\//;
