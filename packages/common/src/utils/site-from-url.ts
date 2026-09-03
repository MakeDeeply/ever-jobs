import { Site } from '@ever-jobs/models';

export interface CompanyUrlResolution {
  site?: Site;
  slug?: string;
}

/**
 * Known canonical ATS board hosts. The first non-empty path segment is
 * treated as the board slug when the site uses a /{slug} URL layout.
 */
const COMPANY_URL_HOST_SITE_MAP: Record<string, Site> = {
  'boards.greenhouse.io': Site.GREENHOUSE,
  'job-boards.greenhouse.io': Site.GREENHOUSE,
  'jobs.ashbyhq.com': Site.ASHBY,
  'jobs.lever.co': Site.LEVER,
};

/**
 * Derive a `Site` token and optional `companySlug` from a canonical ATS
 * career-board URL. Returns an empty object when the host is not a known
 * ATS board host or the URL cannot be parsed.
 *
 * Examples:
 *   https://boards.greenhouse.io/vast
 *     → { site: Site.GREENHOUSE, slug: 'vast' }
 *   https://jobs.ashbyhq.com/northwoodspace
 *     → { site: Site.ASHBY, slug: 'northwoodspace' }
 *   https://job-boards.greenhouse.io/trueanomalyinc/jobs/123
 *     → { site: Site.GREENHOUSE, slug: 'trueanomalyinc' }
 */
export function resolveCompanyUrl(url: string | undefined): CompanyUrlResolution {
  if (!url || typeof url !== 'string') {
    return {};
  }

  let normalized = url.trim();
  if (!normalized) {
    return {};
  }

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {};
  }

  const host = parsed.hostname.toLowerCase();
  const site = COMPANY_URL_HOST_SITE_MAP[host];
  if (!site) {
    return {};
  }

  const slug = parsed.pathname
    .split('/')
    .map((segment) => segment.trim())
    .find((segment) => segment.length > 0);

  return { site, slug };
}
