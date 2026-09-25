import { SourcePlugin } from '@ever-jobs/plugin';

import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  CompensationDto,
  Site,
  DescriptionFormat,
  classifyScrapeError,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  markdownConverter,
  extractEmails,
  parseLocationList,
  randomSleep,
  salaryToCompensation,
} from '@ever-jobs/common';
import {
  WORKDAY_HEADERS,
  WORKDAY_PAGE_SIZE,
  WORKDAY_DETAIL_CONCURRENCY,
  WORKDAY_CATEGORY_FACET,
  WORKDAY_CATEGORY_FACET_CAP,
  parseWorkdaySlug,
  buildWorkdayUrl,
  buildWorkdayDetailUrl,
  parseWorkdayPostedOn,
  workdayListingKey,
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

    try {
      this.logger.log(`Fetching Workday jobs for ${company} (wd${wdNumber}/${site})`);

      // The unfiltered first page seeds both the posting set and the facet
      // catalog, so enumerating the "Job Category" buckets costs no request.
      const firstResponse = await client.post(apiUrl, {
        appliedFacets: {},
        limit: WORKDAY_PAGE_SIZE,
        offset: 0,
        searchText: '',
      });
      const firstPage: WorkdaySearchResponse = firstResponse.data ?? {};
      const categories = this.jobCategoryFacets(firstPage, company, wdNumber, site);

      // Two coarse streams in parallel: the unfiltered list pass resumes after
      // the seed page while the bucketed pass walks each category value. Each
      // stream stays internally sequential behind the courtesy sleep — never
      // more than ~2 list requests in flight.
      const [listingsResult, categoriesResult] = await Promise.allSettled([
        this.fetchListings(client, apiUrl, company, wdNumber, site, firstPage, resultsWanted),
        this.fetchJobCategoryMap(client, apiUrl, company, wdNumber, site, categories),
      ]);

      // The listing set is untrustworthy after a pagination failure, and
      // enriching it would spend one detail request per accumulated entry on it.
      if (listingsResult.status === 'rejected') throw listingsResult.reason;

      const categoryMap =
        categoriesResult.status === 'fulfilled'
          ? categoriesResult.value
          : new Map<string, string>();
      if (categoriesResult.status === 'rejected') {
        this.logger.warn(
          `Workday: category facet pass failed for ${company} (wd${wdNumber}/${site}): ` +
          `${categoriesResult.reason?.message ?? categoriesResult.reason}; ` +
          'departments fall back to detail/subtitle fields',
        );
      }

      return this.buildResponse(
        client,
        listingsResult.value,
        categoryMap,
        company,
        wdNumber,
        site,
        input.descriptionFormat,
      );

    } catch (err: any) {
      this.logger.error(`Workday scrape error for ${company}: ${err.message}`);
      return new JobResponseDto([], classifyScrapeError(err));
    }
  }

  /**
   * The board's "Job Category" drop-down is the search endpoint's
   * `jobFamilyGroup` facet — categories exist only as filter buckets, never on
   * the per-job payloads. Extract the pageable values (id + display label).
   */
  private jobCategoryFacets(
    data: WorkdaySearchResponse,
    company: string,
    wdNumber: string,
    site: string,
  ): Array<{ id: string; label: string }> {
    const facet = data.facets?.find(
      (f) => f.facetParameter === WORKDAY_CATEGORY_FACET,
    );
    const values = (facet?.values ?? [])
      .map((v) => ({ id: v.id?.trim() ?? '', label: v.descriptor?.trim() ?? '' }))
      .filter((v) => v.id.length > 0 && v.label.length > 0);
    if (values.length > WORKDAY_CATEGORY_FACET_CAP) {
      this.logger.warn(
        `Workday: ${values.length} ${WORKDAY_CATEGORY_FACET} facet values for ${company} ` +
        `(wd${wdNumber}/${site}) exceeds cap ${WORKDAY_CATEGORY_FACET_CAP}; skipping category bucketing`,
      );
      return [];
    }
    return values;
  }

  /**
   * Unfiltered list pagination, resuming from a seed page already fetched by
   * the caller. Sequential with a courtesy sleep between requests.
   */
  private async fetchListings(
    client: ReturnType<typeof createHttpClient>,
    apiUrl: string,
    company: string,
    wdNumber: string,
    site: string,
    firstPage: WorkdaySearchResponse,
    resultsWanted: number,
  ): Promise<WorkdayJobListItem[]> {
    const listingsToEnrich: WorkdayJobListItem[] = [];
    const seenKeys = new Set<string>();
    let offset = 0;
    let page = firstPage;

    while (listingsToEnrich.length < resultsWanted) {
      const listings = page.jobPostings ?? [];
      if (listings.length === 0) break;

      this.logger.log(
        `Workday: fetched ${listings.length} jobs at offset ${offset} for ${company}` +
        `${page.total ? ` (total: ${page.total})` : ''}`,
      );

      // Count distinct postings, not pushes: some tenants answer an out-of-range
      // offset by re-serving page 1, and re-serving the same page must never look
      // like progress toward resultsWanted.
      let added = 0;
      for (const listing of listings) {
        if (listingsToEnrich.length >= resultsWanted) break;
        const key = workdayListingKey(listing);
        if (key && seenKeys.has(key)) continue;
        if (key) seenKeys.add(key);
        listingsToEnrich.push(listing);
        added++;
      }

      // The quota is checked before any further fetch — never request a page
      // whose listings could not be consumed anyway.
      if (listingsToEnrich.length >= resultsWanted) break;

      const pageOffset = offset;
      offset += listings.length;

      if (added === 0) {
        this.logger.warn(
          `Workday: pagination not advancing for ${company} (wd${wdNumber}/${site}): ` +
          `page at offset ${pageOffset} returned ${listings.length} jobs, 0 new ` +
          `(server re-served an earlier page); stopping with ${listingsToEnrich.length} distinct jobs`,
        );
        break;
      }

      // If we got less than page size, no more results
      if (listings.length < WORKDAY_PAGE_SIZE) break;

      // A positive total ends paging before the first out-of-range request. Zero or
      // absent is not a count: a real page can report total 0 on some tenants.
      if (typeof page.total === 'number' && page.total > 0 && offset >= page.total) break;

      // Respect rate limiting
      await randomSleep(1000, 2000);

      const response = await client.post(apiUrl, {
        appliedFacets: {},
        limit: WORKDAY_PAGE_SIZE,
        offset,
        searchText: '',
      });
      page = response.data ?? {};
    }

    return listingsToEnrich;
  }

  /**
   * Bucketed pass: page through each category facet value to learn which
   * bucket returns each posting → listingKey → category label. Sequential
   * requests with the same courtesy sleep as the unfiltered pass. A failed
   * bucket logs and yields its partial map; `jobFamilyGroup` is single-valued
   * per posting, so a repeated key can only restate its own bucket.
   */
  private async fetchJobCategoryMap(
    client: ReturnType<typeof createHttpClient>,
    apiUrl: string,
    company: string,
    wdNumber: string,
    site: string,
    categories: Array<{ id: string; label: string }>,
  ): Promise<Map<string, string>> {
    const categoryMap = new Map<string, string>();

    for (const category of categories) {
      try {
        let offset = 0;
        while (true) {
          const response = await client.post(apiUrl, {
            appliedFacets: { [WORKDAY_CATEGORY_FACET]: [category.id] },
            limit: WORKDAY_PAGE_SIZE,
            offset,
            searchText: '',
          });
          const data: WorkdaySearchResponse = response.data ?? {};
          const listings = data.jobPostings ?? [];
          if (listings.length === 0) break;

          // Same re-served-page guard as the unfiltered pass: a page that adds
          // no new keys cannot be making progress through the bucket.
          let added = 0;
          for (const listing of listings) {
            const key = workdayListingKey(listing);
            if (!key) continue;
            if (!categoryMap.has(key)) added++;
            categoryMap.set(key, category.label);
          }
          offset += listings.length;

          if (added === 0) break;
          if (listings.length < WORKDAY_PAGE_SIZE) break;
          if (typeof data.total === 'number' && data.total > 0 && offset >= data.total) break;

          // Respect rate limiting
          await randomSleep(1000, 2000);
        }
      } catch (err: any) {
        this.logger.warn(
          `Workday: category bucket "${category.label}" failed for ${company} ` +
          `(wd${wdNumber}/${site}): ${err.message}`,
        );
      }

      // Same courtesy cadence between buckets as between pages.
      await randomSleep(1000, 2000);
    }

    return categoryMap;
  }

  private async buildResponse(
    client: ReturnType<typeof createHttpClient>,
    listings: WorkdayJobListItem[],
    categoryMap: Map<string, string>,
    company: string,
    wdNumber: string,
    site: string,
    format?: DescriptionFormat,
  ): Promise<JobResponseDto> {
    // Second de-dup pass: enrichment must cost one request per distinct posting even
    // if pagination ever hands over repeats again.
    const seen = new Set<string>();
    const distinct = listings.filter((listing) => {
      const key = workdayListingKey(listing);
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (distinct.length < listings.length) {
      this.logger.warn(
        `Workday: dropped ${listings.length - distinct.length} duplicate listings for ${company} before detail fetch`,
      );
    }

    const details = await this.fetchDetails(client, distinct, company, wdNumber, site);
    const jobPosts = distinct
      .map((listing, index) => {
        try {
          return this.processListing(
            listing,
            details[index] ?? null,
            categoryMap,
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
    let failed = 0;

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
        failed++;
        this.logger.warn(
          `Workday detail failed for ${company} (wd${wdNumber}/${site}) ` +
          `${listing.externalPath ?? listing.title ?? 'unknown job'}: ${result.reason?.message ?? result.reason}`,
        );
        details.push(null);
      });
    }

    if (failed > 0) {
      this.logger.warn(
        `Workday: ${failed} of ${listings.length} detail requests failed for ${company} (wd${wdNumber}/${site})`,
      );
    }

    return details;
  }

  private processListing(
    listing: WorkdayJobListItem,
    detail: WorkdayJobDetail | null,
    categoryMap: Map<string, string>,
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

    // Location: route every label (primary + additional + summary) through the
    // shared parser so multi-location postings are split, then fold in the
    // requisition's ISO-2 country code when the US-only parser left it bare.
    // `locationsText` is sometimes a bare "N Locations" count rather than a
    // place; drop it so the parser doesn't treat the count as a location.
    const summaryText = listing.locationsText?.trim();
    // Workday sometimes emits slugified location labels with underscores
    // (e.g. "Remote_USA"); the underscore is a word character that defeats the
    // shared parser's `\bremote\b` boundary check, so normalize "_" to spaces.
    const locationLabels = [
      info?.location,
      ...(info?.additionalLocations ?? []),
      summaryText && !/^\d+\s+locations?$/i.test(summaryText) ? summaryText : null,
    ].map((label) => label?.replace(/_/g, ' ').replace(/\s+/g, ' ').trim() || null);
    const parsedLocations = parseLocationList(locationLabels);
    const location = parsedLocations.location;
    const locations = parsedLocations.locations;

    // Remote detection: Workday's remoteType enum, plus the parsed labels.
    const remoteType = [info?.remoteType, listing.remoteType]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const isRemote =
      remoteType.includes('remote') || parsedLocations.remoteMentioned;

    // workFromHomeType: prefer Workday's structured remoteType, else parsed labels.
    const workFromHomeType =
      this.workFromHomeTypeFromRemoteType(info?.remoteType ?? listing.remoteType) ??
      parsedLocations.workFromHomeType;

    // Date: prefer the absolute startDate (drift-free), fall back to the
    // relative postedOn label. Both go through the validated ISO/relative parser.
    const datePosted =
      parseWorkdayPostedOn(info?.startDate) ??
      parseWorkdayPostedOn(info?.postedOn ?? listing.postedOn);

    // Compensation: Workday CXS has no structured pay field; recover the
    // pay-transparency range from the description body text.
    const compensation = this.extractCompensationFromText(info?.jobDescription);

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
      ...(locations.length > 0 ? { locations } : {}),
      description,
      compensation,
      datePosted,
      emails: extractEmails(description),
      isRemote,
      ...(workFromHomeType ? { workFromHomeType } : {}),
      site: Site.WORKDAY,
      // ATS-specific fields
      countryCode: info?.jobRequisitionLocation?.country?.alpha2Code ?? null,
      atsId,
      atsType: 'workday',
      // Department precedence: the detail payload's own jobFamily, then the
      // board's "Job Category" facet bucket the listing landed in, then the
      // legacy subtitle heuristic.
      department:
        info?.jobFamily?.[0]?.name ??
        categoryMap.get(workdayListingKey(listing) ?? '') ??
        subtitleTexts[0] ??
        null,
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

  /**
   * Map Workday's free-text `remoteType` ("Hybrid", "Fully Remote",
   * "Remote Eligible", "Field/Customer Site") to a work-from-home label.
   * On-site values (e.g. "Field/Customer Site") resolve to null.
   */
  private workFromHomeTypeFromRemoteType(
    remoteType: string | null | undefined,
  ): string | null {
    const value = remoteType?.toLowerCase() ?? '';
    if (value.includes('hybrid')) return 'Hybrid';
    if (value.includes('remote')) return 'Remote';
    return null;
  }

  /**
   * Workday CXS exposes no structured pay field, so recover a pay-transparency
   * salary range from the description body text via the shared `extractSalary`,
   * honoring the real interval (yearly/hourly) rather than coercing.
   */
  private extractCompensationFromText(
    html?: string | null,
  ): CompensationDto | null {
    const text = html?.trim() ? htmlToPlainText(html) : null;
    return salaryToCompensation(text);
  }
}
