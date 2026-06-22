/** Rippling ATS base URL */
export const RIPPLING_BASE_URL = "https://ats.rippling.com";

/** Maximum simultaneous public job-detail requests. */
export const RIPPLING_DETAIL_CONCURRENCY = 5;

/** Build the public JSON detail endpoint for a board job. */
export function ripplingDetailUrl(companySlug: string, jobId: string): string {
  return `${RIPPLING_BASE_URL}/api/v2/board/${encodeURIComponent(companySlug)}/jobs/${encodeURIComponent(jobId)}`;
}

/** Default headers for Rippling requests */
export const RIPPLING_HEADERS: Record<string, string> = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};
