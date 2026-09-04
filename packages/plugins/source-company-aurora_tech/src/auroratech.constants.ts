/** Ashby public job-board API base URL */
export const ASHBY_API_URL = 'https://api.ashbyhq.com/posting-api/job-board';

/**
 * Query string that opts the public job-board endpoint into serializing the
 * `compensation` payload. Without it, Ashby omits compensation entirely.
 */
export const ASHBY_INCLUDE_COMPENSATION_QUERY = 'includeCompensation=true';

/** Human-readable company name passed through to job posts. */
export const AURORA_COMPANY_NAME = 'Aurora';

/** Canonical company homepage. */
export const AURORA_COMPANY_URL = 'https://aurora.tech/';

/** Default Ashby board slug for Aurora. */
export const AURORA_BOARD_SLUG = 'aurora-operations-inc';

/** Domains that should resolve to this plugin via Spec 5069/5086. */
export const AURORA_COMPANY_DOMAINS = ['aurora.tech', 'www.aurora.tech'];
