import { SourcePlugin } from '@ever-jobs/plugin';

import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  Site,
  DescriptionFormat,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  extractEmails,
  randomSleep,
} from '@ever-jobs/common';
import { LEVER_API_URL, LEVER_HEADERS, LEVER_DELAY_MS } from './lever.constants';
import { LeverJob } from './lever.types';

@SourcePlugin({
  site: Site.LEVER,
  name: 'Lever',
  category: 'ats',
  isAts: true,
})
@Injectable()
export class LeverService implements IScraper {
  private readonly logger = new Logger(LeverService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for Lever scraper');
      return new JobResponseDto([]);
    }

    // ─── Try authenticated API first if credentials are available ────
    const apiKey =
      input.auth?.lever?.apiKey ?? process.env.LEVER_API_KEY ?? null;

    if (apiKey) {
      try {
        const apiResult = await this.scrapeWithApi(input, companySlug, apiKey);
        return apiResult;
      } catch (err: any) {
        this.logger.warn(
          `Lever authenticated API failed for ${companySlug}: ${err.message} — falling back to public scraping`,
        );
      }
    }

    // ─── Existing public scraping logic ─────────────────────────────
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(LEVER_HEADERS);

    const url = `${LEVER_API_URL}/${encodeURIComponent(companySlug)}?mode=json`;

    try {
      this.logger.log(`Fetching Lever jobs for company: ${companySlug}`);
      const response = await client.get(url);
      const jobs: LeverJob[] = response.data ?? [];

      if (!Array.isArray(jobs)) {
        this.logger.warn(`Unexpected Lever response format for ${companySlug}`);
        return new JobResponseDto([]);
      }

      this.logger.log(`Lever: found ${jobs.length} raw jobs for ${companySlug}`);

      const resultsWanted = input.resultsWanted ?? 100;
      const jobPosts: JobPostDto[] = [];

      for (const job of jobs) {
        if (jobPosts.length >= resultsWanted) break;

        try {
          const post = this.processJob(job, companySlug, input.descriptionFormat);
          if (post) {
            jobPosts.push(post);
          }
        } catch (err: any) {
          this.logger.warn(`Error processing Lever job ${job.id}: ${err.message}`);
        }
      }

      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`Lever scrape error for ${companySlug}: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  /**
   * Scrape using the authenticated Lever Postings API.
   * Provides richer data including tags, content blocks, and access to private listings.
   *
   * @see https://hire.lever.co/developer/documentation
   */
  private async scrapeWithApi(
    input: ScraperInputDto,
    companySlug: string,
    apiKey: string,
  ): Promise<JobResponseDto> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    });

    const url = `${LEVER_API_URL}/${encodeURIComponent(companySlug)}?mode=json`;

    this.logger.log(
      `Fetching Lever jobs via authenticated API for company: ${companySlug}`,
    );
    const response = await client.get(url);
    const jobs: LeverJob[] = response.data ?? [];

    if (!Array.isArray(jobs)) {
      this.logger.warn(
        `Unexpected Lever API response format for ${companySlug}`,
      );
      return new JobResponseDto([]);
    }

    this.logger.log(
      `Lever authenticated API: found ${jobs.length} jobs for ${companySlug}`,
    );

    const resultsWanted = input.resultsWanted ?? 100;
    const jobPosts: JobPostDto[] = [];

    for (const job of jobs) {
      if (jobPosts.length >= resultsWanted) break;

      try {
        const post = this.processApiJob(job, companySlug, input.descriptionFormat);
        if (post) {
          jobPosts.push(post);
        }
      } catch (err: any) {
        this.logger.warn(
          `Error processing Lever API job ${job.id}: ${err.message}`,
        );
      }
    }

    return new JobResponseDto(jobPosts);
  }

  /**
   * Map a Lever API job to JobPostDto.
   * The authenticated API may return additional fields such as tags and
   * content list blocks that are not available from the public endpoint.
   */
  private processApiJob(
    job: LeverJob,
    companySlug: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.text;
    if (!title) return null;

    const description = this.buildDescription(job);

    // Location from categories
    const locationStr = job.categories?.location ?? null;
    const location = locationStr
      ? new LocationDto({ city: locationStr })
      : null;

    // Determine remote status
    const isRemote =
      job.workplaceType?.toLowerCase() === 'remote' ||
      locationStr?.toLowerCase().includes('remote') ||
      false;

    // Employment type from categories.commitment
    const commitment = job.categories?.commitment ?? null;

    // Team / department from categories
    const team = job.categories?.team ?? null;

    return new JobPostDto({
      id: `lever-${job.id}`,
      title,
      companyName: companySlug,
      jobUrl: job.hostedUrl ?? `https://jobs.lever.co/${companySlug}/${job.id}`,
      location,
      description,
      datePosted: job.createdAt
        ? new Date(job.createdAt).toISOString().split('T')[0]
        : null,
      isRemote,
      emails: extractEmails(description),
      site: Site.LEVER,
      // ATS-specific fields
      atsId: job.id ?? null,
      atsType: 'lever',
      team,
      employmentType: commitment,
      applyUrl: job.applyUrl ?? null,
    });
  }

  private processJob(
    job: LeverJob,
    companySlug: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.text;
    if (!title) return null;

    const description = this.buildDescription(job);

    // Location from categories
    const locationStr = job.categories?.location ?? null;
    const location = locationStr
      ? new LocationDto({ city: locationStr })
      : null;

    // Determine remote status
    const isRemote =
      job.workplaceType?.toLowerCase() === 'remote' ||
      locationStr?.toLowerCase().includes('remote') ||
      false;

    // Employment type from categories.commitment
    const commitment = job.categories?.commitment ?? null;

    return new JobPostDto({
      id: `lever-${job.id}`,
      title,
      companyName: companySlug,
      jobUrl: job.hostedUrl ?? `https://jobs.lever.co/${companySlug}/${job.id}`,
      location,
      description,
      datePosted: job.createdAt
        ? new Date(job.createdAt).toISOString().split('T')[0]
        : null,
      isRemote,
      emails: extractEmails(description),
      site: Site.LEVER,
      // ATS-specific fields
      atsId: job.id ?? null,
      atsType: 'lever',
      team: job.categories?.team ?? null,
      employmentType: commitment,
      applyUrl: job.applyUrl ?? null,
    });
  }

  private buildDescription(job: LeverJob): string | null {
    const parts: string[] = [];

    const combinedDescription = this.firstNonEmpty(
      job.descriptionPlain,
      job.description,
    );

    if (combinedDescription) {
      parts.push(this.toPlainText(combinedDescription));
    } else {
      const opening = this.firstNonEmpty(job.openingPlain, job.opening);
      const body = this.firstNonEmpty(
        job.descriptionBodyPlain,
        job.descriptionBody,
      );
      if (opening) parts.push(this.toPlainText(opening));
      if (body) parts.push(this.toPlainText(body));
    }

    if (Array.isArray(job.lists)) {
      for (const list of job.lists) {
        const heading = this.firstNonEmpty(list.text);
        const body = this.firstNonEmpty(list.content);
        const listParts = [
          heading ? this.toPlainText(heading) : null,
          body ? this.toPlainText(body) : null,
        ].filter((part): part is string => Boolean(part));

        if (listParts.length > 0) {
          parts.push(listParts.join('\n'));
        }
      }
    }

    const additional = this.firstNonEmpty(job.additionalPlain, job.additional);
    if (additional) {
      parts.push(this.toPlainText(additional));
    }

    const description = parts
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .join('\n\n');

    return description || null;
  }

  private firstNonEmpty(...values: Array<string | null | undefined>): string | null {
    for (const value of values) {
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }
    return null;
  }

  private toPlainText(value: string): string {
    return value.includes('<') && value.includes('>')
      ? htmlToPlainText(value)
      : value.trim();
  }
}
