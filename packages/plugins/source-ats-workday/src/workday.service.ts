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
  markdownConverter,
  extractEmails,
  randomSleep,
} from '@ever-jobs/common';
import {
  WORKDAY_HEADERS,
  WORKDAY_PAGE_SIZE,
  WORKDAY_DETAIL_CONCURRENCY,
  parseWorkdaySlug,
  buildWorkdayUrl,
  buildWorkdayDetailUrl,
  parseWorkdayPostedOn,
} from './workday.constants';
import {
  WorkdayJobDetail,
  WorkdayJobListItem,
  WorkdaySearchResponse,
} from './workday.types';

@SourcePlugin({
  site: Site.WORKDAY,
  name: 'Workday',
  category: 'ats',
  isAts: true,
})
@Injectable()
export class WorkdayService implements IScraper {
  private readonly logger = new Logger(WorkdayService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for Workday scraper');
      return new JobResponseDto([]);
    }

    const { company, wdNumber, site } = parseWorkdaySlug(companySlug);
    const apiUrl = buildWorkdayUrl(company, wdNumber, site);

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(WORKDAY_HEADERS);

    const resultsWanted = input.resultsWanted ?? 100;
    const listingsToEnrich: WorkdayJobListItem[] = [];
    let offset = 0;

    try {
      this.logger.log(`Fetching Workday jobs for ${company} (wd${wdNumber}/${site})`);

      while (listingsToEnrich.length < resultsWanted) {
        const payload = {
          appliedFacets: {},
          limit: WORKDAY_PAGE_SIZE,
          offset,
          searchText: '',
        };

        const response = await client.post(apiUrl, payload);
        const data: WorkdaySearchResponse = response.data ?? {};
        const listings = data.jobPostings ?? [];

        if (listings.length === 0) break;

        this.logger.log(
          `Workday: fetched ${listings.length} jobs at offset ${offset} for ${company}` +
          `${data.total ? ` (total: ${data.total})` : ''}`,
        );

        for (const listing of listings) {
          if (listingsToEnrich.length >= resultsWanted) break;
          listingsToEnrich.push(listing);
        }

        offset += listings.length;

        // If we got less than page size, no more results
        if (listings.length < WORKDAY_PAGE_SIZE) break;

        // Respect rate limiting
        await randomSleep(1000, 2000);
      }

    } catch (err: any) {
      this.logger.error(`Workday scrape error for ${company}: ${err.message}`);
    }

    return this.buildResponse(
      client,
      listingsToEnrich,
      company,
      wdNumber,
      site,
      input.descriptionFormat,
    );
  }

  private async buildResponse(
    client: ReturnType<typeof createHttpClient>,
    listings: WorkdayJobListItem[],
    company: string,
    wdNumber: string,
    site: string,
    format?: DescriptionFormat,
  ): Promise<JobResponseDto> {
    const details = await this.fetchDetails(client, listings, company, wdNumber, site);
    const jobPosts = listings
      .map((listing, index) => {
        try {
          return this.processListing(
            listing,
            details[index] ?? null,
            company,
            wdNumber,
            site,
            format,
          );
        } catch (err: any) {
          this.logger.warn(`Error processing Workday listing: ${err.message}`);
          return null;
        }
      })
      .filter((post): post is JobPostDto => post !== null);

    this.logger.log(`Workday total: ${jobPosts.length} jobs for ${company}`);
    return new JobResponseDto(jobPosts);
  }

  private async fetchDetails(
    client: ReturnType<typeof createHttpClient>,
    listings: WorkdayJobListItem[],
    company: string,
    wdNumber: string,
    site: string,
  ): Promise<Array<WorkdayJobDetail | null>> {
    const details: Array<WorkdayJobDetail | null> = [];

    for (let index = 0; index < listings.length; index += WORKDAY_DETAIL_CONCURRENCY) {
      const batch = listings.slice(index, index + WORKDAY_DETAIL_CONCURRENCY);
      const settled = await Promise.allSettled(
        batch.map(async (listing): Promise<WorkdayJobDetail | null> => {
          if (!listing.externalPath) return null;
          const url = buildWorkdayDetailUrl(company, wdNumber, site, listing.externalPath);
          const response = await client.get(url);
          return (response.data as WorkdayJobDetail | undefined) ?? null;
        }),
      );

      settled.forEach((result, batchIndex) => {
        if (result.status === 'fulfilled') {
          details.push(result.value);
          return;
        }
        const listing = batch[batchIndex];
        this.logger.warn(
          `Workday detail failed for ${listing.externalPath ?? listing.title ?? 'unknown job'}: ${result.reason?.message ?? result.reason}`,
        );
        details.push(null);
      });
    }

    return details;
  }

  private processListing(
    listing: WorkdayJobListItem,
    detail: WorkdayJobDetail | null,
    company: string,
    wdNumber: string,
    site: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = listing.title;
    if (!title) return null;
    const info = detail?.jobPostingInfo;
    const hiringOrganizationName = detail?.hiringOrganization?.name;
    const companyName = hiringOrganizationName?.trim()
      ? hiringOrganizationName
      : company;

    // Extract job path for URL construction
    const externalPath = listing.externalPath ?? '';
    const summaryJobUrl = externalPath
      ? `https://${company}.wd${wdNumber}.myworkdayjobs.com${externalPath.startsWith('/') ? '' : '/'}${externalPath}`
      : `https://${company}.wd${wdNumber}.myworkdayjobs.com/en-US/${site}/details/${encodeURIComponent(title)}`;
    const jobUrl = info?.externalUrl ?? summaryJobUrl;

    const description = this.formatDescription(info?.jobDescription, format);

    // Location
    const locationStr = this.mergeLocations(
      info?.location,
      info?.additionalLocations,
      listing.locationsText,
    );
    const location = locationStr
      ? new LocationDto({ city: locationStr })
      : null;

    // Remote detection
    const remoteText = [locationStr, info?.remoteType, listing.remoteType]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const isRemote = remoteText.includes('remote');

    // Date from postedOn (relative labels like "Posted 3 Days Ago" -> ISO date or null)
    const datePosted = parseWorkdayPostedOn(info?.postedOn ?? listing.postedOn);

    // Extract subtitle info (often contains category/department)
    const subtitleTexts = listing.subtitles
      ?.flatMap((sub) => sub.instances?.map((i) => i.text) ?? [])
      .filter(Boolean) ?? [];

    // Extract job ID from externalPath (e.g., "/job/123456")
    const jobIdMatch = externalPath.match(/\/(\d+)(?:\/|$)/);
    const atsId = info?.jobReqId ?? jobIdMatch?.[1] ?? (externalPath || null);

    return new JobPostDto({
      id: `wd-${company}-${atsId ?? title.replace(/\s+/g, '-').toLowerCase()}`,
      title,
      companyName,
      jobUrl,
      location,
      description,
      datePosted,
      emails: extractEmails(description),
      isRemote,
      site: Site.WORKDAY,
      // ATS-specific fields
      atsId,
      atsType: 'workday',
      department: info?.jobFamily?.[0]?.name ?? subtitleTexts[0] ?? null,
      employmentType: info?.timeType ?? info?.workerSubType ?? null,
    });
  }

  private formatDescription(
    html?: string | null,
    format?: DescriptionFormat,
  ): string | null {
    if (!html?.trim()) return null;
    if (format === DescriptionFormat.HTML) return html;
    if (format === DescriptionFormat.MARKDOWN) return markdownConverter(html);
    return htmlToPlainText(html);
  }

  private mergeLocations(
    primary?: string | null,
    additional?: string[] | null,
    summary?: string | null,
  ): string | null {
    const concrete = [primary, ...(additional ?? [])]
      .map((location) => location?.trim())
      .filter((location): location is string => !!location);
    const summaryLocation = summary?.trim();
    if (summaryLocation && (concrete.length === 0 || !/^\d+\s+locations?$/i.test(summaryLocation))) {
      concrete.push(summaryLocation);
    }

    const seen = new Set<string>();
    const unique = concrete.filter((location) => {
      const key = location.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.length > 0 ? unique.join('; ') : null;
  }
}
