/**
 * Shapes returned by the careers-page.com JSON API (Manatal white-label).
 *
 * Spec 5021 — captured from real responses (castelion-corporation, ghostwerks,
 * calqulate). Salary fields appear only when `is_salary_visible` is true and are
 * serialised as decimal strings (e.g. `"60000.00"`). The API exposes no
 * employment-type, department, job-function, remote flag, or posted date, so
 * those JobPostDto fields are intentionally left unmapped (never fabricated).
 */
export interface ManatalResponse {
  count: number;
  /** Absolute URL of the next page, or null on the last page. */
  next: string | null;
  previous?: string | null;
  results: ManatalJob[];
}

export interface ManatalJob {
  id: number;
  /** Short alphanumeric code used in the public job URL. */
  hash: string;
  position_name: string;
  /** HTML body of the posting. */
  description: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  zipcode: string | null;
  /** Pre-joined "City, State, Country" string. */
  location_display: string | null;
  is_salary_visible: boolean;
  is_pinned_in_career_page?: boolean;
  /** Present only when `is_salary_visible`; decimal strings or numbers. */
  salary_min?: number | string | null;
  salary_max?: number | string | null;
  currency_code?: string | null;
}
