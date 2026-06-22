/**
 * TypeScript interfaces for Rippling ATS data.
 * Ported from ats-scrapers/models/rippling.py
 */

export interface RipplingLocation {
  name?: string | null;
  country?: string | null;
  countryCode?: string | null;
  state?: string | null;
  stateCode?: string | null;
  city?: string | null;
  workplaceType?: string | null;
}

export interface RipplingPayRangeDetail {
  min_value?: number | null;
  max_value?: number | null;
  currency?: string | null;
  interval?: string | null;
}

export interface RipplingDescription {
  company?: string | null;
  role?: string | null;
}

export interface RipplingJob {
  uuid?: string | null;
  id?: string | null;
  name?: string | null;
  title?: string | null;
  url?: string | null;
  applyUrl?: string | null;
  description?: RipplingDescription | null;
  workLocations?: string[] | null;
  locations?: RipplingLocation[] | null;
  department?: Record<string, unknown> | null;
  employmentType?: Record<string, string> | null;
  createdOn?: string | null;
  companyName?: string | null;
  payRangeDetails?: RipplingPayRangeDetail[] | null;
}

/** The shape of __NEXT_DATA__ JSON nested inside the HTML page */
export interface RipplingNextData {
  props?: {
    pageProps?: {
      dehydratedState?: {
        queries?: Array<{
          state?: {
            data?: {
              items?: RipplingJob[];
              [key: string]: unknown;
            };
            [key: string]: unknown;
          };
          [key: string]: unknown;
        }>;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
