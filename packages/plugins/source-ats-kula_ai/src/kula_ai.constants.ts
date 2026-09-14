/** Kula careers portal origin. */
export const KULA_AI_BASE_URL = 'https://careers.kula.ai';

/** Default ceiling on jobs returned when `input.resultsWanted` is unset. */
export const KULA_AI_DEFAULT_RESULTS_WANTED = 100;

/** Default description depth key. */
export const KULA_AI_DEFAULT_DESCRIPTION_DEPTH = 'detail-all';

/** Description depth budget (mirrors other source plugins). */
export const KULA_AI_DESCRIPTION_BUDGET: Record<string, number> = {
  board: 0,
  'detail-25': 25,
  'detail-all': Number.POSITIVE_INFINITY,
};

/** Chromium launch flags. `--disable-blink-features=AutomationControlled` hides headless signatures. */
export const KULA_AI_LAUNCH_ARGS: readonly string[] = [
  '--disable-blink-features=AutomationControlled',
  '--disable-dev-shm-usage',
  '--no-sandbox',
] as const;

/** Settle time (ms) after `networkidle` to let React/Chakra render job cards. */
export const KULA_AI_SETTLE_MS = 3_000;

/** Initial page navigation timeout (ms). */
export const KULA_AI_GOTO_TIMEOUT_MS = 60_000;

/** Max concurrent detail-page fetches. */
export const KULA_AI_DETAIL_CONCURRENCY = 5;

/** Sentinel error codes recorded via Logger.warn; `scrape()` always resolves. */
export const KULA_AI_ERR_UNAVAILABLE = 'ERR_KULA_AI_UNAVAILABLE';
export const KULA_AI_ERR_NAV_FAILED = 'ERR_KULA_AI_NAV_FAILED';
export const KULA_AI_ERR_FETCH_FAILED = 'ERR_KULA_AI_FETCH_FAILED';
export const KULA_AI_ERR_BAD_INPUT = 'ERR_KULA_AI_BAD_INPUT';
