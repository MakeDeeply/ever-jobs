import { SourcePlugin } from '@ever-jobs/plugin';

import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  classifyScrapeError,
  ScrapeDiagnostics,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  CompensationDto,
  CompensationInterval,
  Site,
  DescriptionFormat,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  markdownConverter,
  extractEmails,
  toDateOnly,
} from '@ever-jobs/common';
import { RECRUITEE_HEADERS, RECRUITEE_OFFICIAL_API_BASE } from './recruitee.constants';
import { RecruiteeOffer, RecruiteeResponse } from './recruitee.types';

@SourcePlugin({
  site: Site.RECRUITEE,
  name: 'Recruitee',
  category: 'ats',
  isAts: true,
})
@Injectable()
export class RecruiteeService implements IScraper {
  private readonly logger = new Logger(RecruiteeService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug?.trim();
    if (!companySlug) {
      this.logger.warn('No companySlug provided for Recruitee scraper');
      return new JobResponseDto(
        [],
        new ScrapeDiagnostics('bad_input', 'no companySlug provided'),
      );
    }

    const baseUrl = this.getBoardBaseUrl(input);
    if (!baseUrl) {
      return new JobResponseDto(
        [],
        new ScrapeDiagnostics('bad_input', `invalid Recruitee board address: ${input.companyUrl || companySlug}`),
      );
    }

    // A dotted slug that is not a *.recruitee.com subdomain is a custom-domain
    // host, which the official api.recruitee.com/c/{id}/offers endpoint does not
    // accept as an account id.
    const isCustomDomainHost =
      companySlug.includes('.') && !companySlug.toLowerCase().endsWith('.recruitee.com');

    // Check for API token: per-request auth overrides env var
    const apiToken = input.auth?.recruitee?.apiToken ?? process.env.RECRUITEE_API_TOKEN;
    if (apiToken && !isCustomDomainHost) {
      try {
        const result = await this.scrapeWithApi(apiToken, companySlug, input);
        return result;
      } catch (err: any) {
        this.logger.warn(
          `Recruitee authenticated API failed for ${companySlug}: ${err.message}. Falling back to public scraping.`,
        );
      }
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(RECRUITEE_HEADERS);

    const url = `${baseUrl}/api/offers`;

    try {
      this.logger.log(`Fetching Recruitee jobs for company: ${companySlug}`);
      const response = await client.get(url);
      const data: RecruiteeResponse = response.data ?? { offers: [] };
      const offers = data.offers ?? [];

      this.logger.log(`Recruitee: found ${offers.length} raw jobs for ${companySlug}`);

      const resultsWanted = input.resultsWanted ?? 100;
      const jobPosts: JobPostDto[] = [];

      for (const offer of offers) {
        if (jobPosts.length >= resultsWanted) break;

        try {
          const post = this.processOffer(offer, baseUrl, companySlug, input.descriptionFormat);
          if (post) {
            jobPosts.push(post);
          }
        } catch (err: any) {
          this.logger.warn(`Error processing Recruitee offer ${offer.id}: ${err.message}`);
        }
      }

      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`Recruitee scrape error for ${companySlug}: ${err.message}`);
      return new JobResponseDto([], classifyScrapeError(err));
    }
  }

  /**
   * Resolve the canonical board origin from `companyUrl` or `companySlug`.
   *
   * - `companyUrl` is normalized to its origin if provided.
   * - A `companySlug` that already starts with `http(s)://` is parsed as a URL.
   * - A `companySlug` that contains a dot and is not a `*.recruitee.com`
   *   subdomain is treated as a custom-domain host and prefixed with `https://`.
   * - Everything else is treated as a standard Recruitee account slug.
   */
  private getBoardBaseUrl(input: ScraperInputDto): string | null {
    const rawUrl = input.companyUrl?.trim();
    if (rawUrl) {
      try {
        const url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
        return `${url.protocol}//${url.host}`;
      } catch {
        this.logger.warn(`Invalid companyUrl for Recruitee: ${rawUrl}`);
        return null;
      }
    }

    const slug = input.companySlug?.trim() ?? '';
    if (!slug) {
      return null;
    }

    if (/^https?:\/\//i.test(slug)) {
      try {
        const url = new URL(slug);
        return `${url.protocol}//${url.host}`;
      } catch {
        this.logger.warn(`Invalid Recruitee companySlug as URL: ${slug}`);
        return null;
      }
    }

    const lowerSlug = slug.toLowerCase();
    if (lowerSlug.endsWith('.recruitee.com')) {
      return `https://${slug}`;
    }

    if (slug.includes('.')) {
      return `https://${slug}`;
    }

    return `https://${encodeURIComponent(slug)}.recruitee.com`;
  }

  /**
   * Provides access to full offer details including pipeline stages,
   * custom fields, and non-published offers.
   *
   * @see https://docs.recruitee.com/reference/getting-started
   */
  private async scrapeWithApi(
    apiToken: string,
    companySlug: string,
    input: ScraperInputDto,
  ): Promise<JobResponseDto> {
    this.logger.log(
      `Recruitee: using authenticated API for company: ${companySlug}`,
    );

    const baseUrl = this.getBoardBaseUrl(input);
    if (!baseUrl) {
      return new JobResponseDto(
        [],
        new ScrapeDiagnostics('bad_input', `invalid Recruitee board address: ${input.companyUrl || companySlug}`),
      );
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });

    const url = `${RECRUITEE_OFFICIAL_API_BASE}/${encodeURIComponent(companySlug)}/offers?scope=published`;

    const response = await client.get(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const data: RecruiteeResponse = response.data ?? { offers: [] };
    const offers = data.offers ?? [];

    this.logger.log(
      `Recruitee (authenticated): found ${offers.length} offers for ${companySlug}`,
    );

    const resultsWanted = input.resultsWanted ?? 100;
    const jobPosts: JobPostDto[] = [];

    for (const offer of offers) {
      if (jobPosts.length >= resultsWanted) break;

      try {
        const post = this.processOffer(offer, baseUrl, companySlug, input.descriptionFormat);
        if (post) {
          jobPosts.push(post);
        }
      } catch (err: any) {
        this.logger.warn(
          `Error processing Recruitee API offer ${offer.id}: ${err.message}`,
        );
      }
    }

    return new JobResponseDto(jobPosts);
  }

  private processOffer(
    offer: RecruiteeOffer,
    baseUrl: string,
    companySlug: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = offer.title;
    if (!title) return null;

    // Description is HTML
    let description: string | null = null;
    if (offer.description) {
      if (format === DescriptionFormat.HTML) {
        description = offer.description;
      } else if (format === DescriptionFormat.MARKDOWN) {
        description = markdownConverter(offer.description) ?? offer.description;
      } else {
        description = htmlToPlainText(offer.description);
      }
    }

    // Location from city/state/country fields
    const location = new LocationDto({
      city: offer.city ?? null,
      state: offer.state ?? null,
      country: offer.country ?? null,
    });

    // Compensation from salary_min/salary_max
    const compensation = this.extractCompensation(offer);

    // Job URL from careers_url + slug, or from the resolved board base URL
    const jobUrl = offer.careers_url && offer.slug
      ? `${offer.careers_url}/${offer.slug}`
      : `${baseUrl}/o/${offer.slug ?? offer.id}`;

    // Date posted
    const datePosted = offer.created_at
      ? toDateOnly(offer.created_at)
      : null;

    return new JobPostDto({
      id: `recruitee-${offer.id}`,
      title,
      companyName: offer.company_name ?? companySlug,
      jobUrl,
      location,
      description,
      compensation,
      datePosted,
      isRemote: offer.remote ?? false,
      emails: extractEmails(description),
      site: Site.RECRUITEE,
      // ATS-specific fields
      atsId: String(offer.id),
      atsType: 'recruitee',
      department: offer.department ?? null,
    });
  }

  /**
   * Extract compensation from Recruitee salary fields.
   * Skips if both salary_min and salary_max are null.
   */
  private extractCompensation(offer: RecruiteeOffer): CompensationDto | null {
    if (offer.salary_min == null && offer.salary_max == null) {
      return null;
    }

    return new CompensationDto({
      interval: CompensationInterval.YEARLY,
      minAmount: offer.salary_min ?? undefined,
      maxAmount: offer.salary_max ?? undefined,
      currency: offer.salary_currency ?? 'USD',
    });
  }
}
