import { SourcePlugin } from "@ever-jobs/plugin";

import { Injectable, Logger } from "@nestjs/common";
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  CompensationDto,
  Site,
  DescriptionFormat,
  getJobTypeFromString,
  getCompensationInterval,
} from "@ever-jobs/models";
import {
  createHttpClient,
  extractEmails,
  htmlToPlainText,
  markdownConverter,
} from "@ever-jobs/common";
import {
  RIPPLING_BASE_URL,
  RIPPLING_DETAIL_CONCURRENCY,
  RIPPLING_HEADERS,
  ripplingDetailUrl,
} from "./rippling.constants";
import {
  RipplingJob,
  RipplingNextData,
  RipplingPayRangeDetail,
} from "./rippling.types";

const RIPPLING_JOB_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@SourcePlugin({
  site: Site.RIPPLING,
  name: "Rippling",
  category: "ats",
  isAts: true,
})
@Injectable()
export class RipplingService implements IScraper {
  private readonly logger = new Logger(RipplingService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn("No companySlug provided for Rippling scraper");
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(RIPPLING_HEADERS);

    const resultsWanted = input.resultsWanted ?? 100;
    if (resultsWanted <= 0) return new JobResponseDto([]);

    const listedJobs: RipplingJob[] = [];
    const seenJobIds = new Set<string>();

    for (let page = 0; listedJobs.length < resultsWanted; page++) {
      const url = this.buildJobsUrl(companySlug, page);
      let jobs: RipplingJob[];

      try {
        this.logger.log(
          `Fetching Rippling jobs for ${companySlug}, page ${page}`,
        );
        const response = await client.get(url);
        const html: string =
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data);
        jobs = this.extractJobsFromHtml(html);
      } catch (err: any) {
        const message = `Rippling page ${page} failed for ${companySlug}: ${err.message}`;
        if (page === 0) this.logger.error(message);
        else
          this.logger.warn(
            `${message}; returning ${listedJobs.length} partial results`,
          );
        break;
      }

      if (jobs.length === 0) break;
      this.logger.log(
        `Rippling: found ${jobs.length} raw jobs on page ${page}`,
      );

      let newJobsOnPage = 0;
      for (const job of jobs) {
        if (listedJobs.length >= resultsWanted) break;

        const sourceId = this.getSourceIdentity(job);
        if (!sourceId) continue;
        if (seenJobIds.has(sourceId)) continue;
        seenJobIds.add(sourceId);
        newJobsOnPage++;

        listedJobs.push(job);
      }

      // Rippling may redirect an out-of-range page to an earlier page. A page
      // with no unseen source IDs is therefore the reliable exhaustion signal.
      if (newJobsOnPage === 0) break;
    }

    const enrichedJobs = await this.enrichMissingDescriptions(
      client,
      listedJobs,
      companySlug,
    );
    const jobPosts = enrichedJobs
      .map((job) => {
        try {
          return this.processJob(job, companySlug, input.descriptionFormat);
        } catch (err: any) {
          this.logger.warn(
            `Error processing Rippling job ${job.id}: ${err.message}`,
          );
          return null;
        }
      })
      .filter((post): post is JobPostDto => post !== null);

    this.logger.log(
      `Rippling: scraped ${jobPosts.length} jobs for ${companySlug}`,
    );
    return new JobResponseDto(jobPosts);
  }

  private buildJobsUrl(companySlug: string, page: number): string {
    const slug = encodeURIComponent(companySlug);
    return `${RIPPLING_BASE_URL}/${slug}/jobs?page=${page}&jobBoardSlug=${slug}`;
  }

  private getSourceIdentity(job: RipplingJob): string | null {
    const sourceId = job.uuid ?? job.id;
    return typeof sourceId === "string" &&
      RIPPLING_JOB_ID_PATTERN.test(sourceId)
      ? sourceId
      : null;
  }

  private async enrichMissingDescriptions(
    client: ReturnType<typeof createHttpClient>,
    jobs: RipplingJob[],
    companySlug: string,
  ): Promise<RipplingJob[]> {
    const enriched: RipplingJob[] = [];

    for (
      let index = 0;
      index < jobs.length;
      index += RIPPLING_DETAIL_CONCURRENCY
    ) {
      const batch = jobs.slice(index, index + RIPPLING_DETAIL_CONCURRENCY);
      const settled = await Promise.allSettled(
        batch.map((job) => this.enrichJobDescription(client, job, companySlug)),
      );

      settled.forEach((result, batchIndex) => {
        enriched.push(
          result.status === "fulfilled" ? result.value : batch[batchIndex],
        );
      });
    }

    return enriched;
  }

  private async enrichJobDescription(
    client: ReturnType<typeof createHttpClient>,
    job: RipplingJob,
    companySlug: string,
  ): Promise<RipplingJob> {
    if (this.hasDescription(job.description)) return job;
    const sourceId = this.getSourceIdentity(job);
    if (!sourceId) return job;

    try {
      const response = await client.get<unknown>(
        ripplingDetailUrl(companySlug, sourceId),
        { headers: { Accept: "application/json" } },
      );
      const detail = this.unwrapDetailJob(response.data);
      if (!detail) return job;
      return {
        ...job,
        description: this.hasDescription(detail.description)
          ? detail.description
          : job.description,
        applyUrl: detail.applyUrl ?? job.applyUrl,
      };
    } catch (err: any) {
      this.logger.warn(
        `Rippling detail failed for ${sourceId}: ${err.message}`,
      );
      return job;
    }
  }

  private unwrapDetailJob(payload: unknown): RipplingJob | null {
    if (!payload || typeof payload !== "object" || Array.isArray(payload))
      return null;
    const record = payload as Record<string, unknown>;
    const nested = record.data;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return nested as RipplingJob;
    }
    return record as RipplingJob;
  }

  private hasDescription(description: RipplingJob["description"]): boolean {
    return (
      !!description &&
      [description.company, description.role].some(
        (part) => typeof part === "string" && part.trim().length > 0,
      )
    );
  }

  /**
   * Extract job data from HTML page by finding and parsing the __NEXT_DATA__ script tag.
   * Rippling uses Next.js SSR which embeds the initial data as JSON in a script tag.
   */
  private extractJobsFromHtml(html: string): RipplingJob[] {
    // Find __NEXT_DATA__ script content using regex (no DOM parser needed)
    const nextDataMatch = html.match(
      /<script\s+id="__NEXT_DATA__"\s+type="application\/json"[^>]*>([\s\S]*?)<\/script>/i,
    );

    if (!nextDataMatch?.[1]) {
      this.logger.warn("Could not find __NEXT_DATA__ in Rippling HTML");
      return [];
    }

    try {
      const nextData: RipplingNextData = JSON.parse(nextDataMatch[1]);

      // Navigate the nested structure to find job items
      const queries = nextData.props?.pageProps?.dehydratedState?.queries ?? [];
      let foundItemsArray = false;

      for (const query of queries) {
        const items = query.state?.data?.items;
        if (Array.isArray(items)) {
          foundItemsArray = true;
          const jobs = items.filter((item): item is RipplingJob =>
            this.isRipplingJob(item),
          );
          if (jobs.length > 0) return jobs;
        }
      }

      if (foundItemsArray) return [];

      // Fallback: try other common paths in the data structure
      const pageProps = nextData.props?.pageProps;
      if (pageProps) {
        // Some Rippling boards use a different structure
        const jobs = (pageProps as Record<string, unknown>).jobs;
        if (Array.isArray(jobs)) {
          return jobs.filter((job): job is RipplingJob =>
            this.isRipplingJob(job),
          );
        }
      }

      this.logger.warn("No job items found in Rippling __NEXT_DATA__");
      return [];
    } catch (err: any) {
      this.logger.error(`Error parsing Rippling __NEXT_DATA__: ${err.message}`);
      return [];
    }
  }

  private processJob(
    job: RipplingJob,
    companySlug: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    if (!this.isRipplingJob(job)) return null;
    const sourceId = this.getSourceIdentity(job)!;
    const title = job.title ?? job.name;

    const description = this.formatDescription(job.description, format);

    const primaryLoc = job.locations?.[0];
    const workLocation =
      job.workLocations?.find((value) => value.trim().length > 0) ?? null;
    const city = primaryLoc?.city ?? primaryLoc?.name ?? workLocation;
    const state = primaryLoc?.state ?? primaryLoc?.stateCode ?? null;
    const country = primaryLoc?.country ?? primaryLoc?.countryCode ?? null;
    const location =
      city || state || country
        ? new LocationDto({ city: city ?? null, state, country })
        : null;

    // Remote detection
    const isRemote =
      primaryLoc?.workplaceType?.toLowerCase() === "remote" ||
      job.workLocations?.some((loc) => loc.toLowerCase().includes("remote")) ||
      false;

    // Compensation from payRangeDetails
    const compensation = this.extractCompensation(job.payRangeDetails);

    const employmentType = job.employmentType?.label?.trim() || null;
    const mappedJobType = employmentType
      ? getJobTypeFromString(employmentType)
      : null;

    // Department
    const dept = job.department;
    const department = dept
      ? ((dept as Record<string, string>).name ?? null)
      : null;

    const jobUrl =
      job.url ?? `${RIPPLING_BASE_URL}/${companySlug}/jobs/${sourceId}`;
    const applyUrl = job.applyUrl?.trim();

    return new JobPostDto({
      id: `rippling-${sourceId}`,
      title: title!.trim(),
      companyName: job.companyName ?? companySlug,
      companyUrl: `${RIPPLING_BASE_URL}/${encodeURIComponent(companySlug)}/jobs`,
      jobUrl,
      ...(applyUrl && applyUrl !== jobUrl ? { applyUrl } : {}),
      location,
      description,
      compensation,
      datePosted: job.createdOn
        ? new Date(job.createdOn).toISOString().split("T")[0]
        : null,
      isRemote,
      emails: extractEmails(description),
      site: Site.RIPPLING,
      // ATS-specific fields
      atsId: sourceId,
      atsType: "rippling",
      department,
      ...(mappedJobType
        ? { jobType: [mappedJobType] }
        : employmentType
          ? { employmentType }
          : {}),
    });
  }

  private formatDescription(
    source: RipplingJob["description"],
    format?: DescriptionFormat,
  ): string | null {
    if (!source) return null;
    const html = [source.company, source.role]
      .filter(
        (part): part is string =>
          typeof part === "string" && part.trim().length > 0,
      )
      .map((part) => part.trim())
      .join("\n\n");
    if (!html) return null;

    if (format === DescriptionFormat.HTML) return html;
    if (format === DescriptionFormat.PLAIN) return htmlToPlainText(html);
    return markdownConverter(html) ?? html;
  }

  /**
   * Fail closed on dehydrated query items. Rippling embeds filter option arrays
   * (locations, departments, and similar data) beside the actual jobs query;
   * those objects may have a `name` but are not job postings.
   */
  private isRipplingJob(value: unknown): value is RipplingJob {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return false;
    const job = value as RipplingJob;
    const sourceId = job.uuid ?? job.id;
    const title = job.title ?? job.name;
    if (
      typeof sourceId !== "string" ||
      !RIPPLING_JOB_ID_PATTERN.test(sourceId) ||
      typeof title !== "string" ||
      title.trim().length === 0
    ) {
      return false;
    }

    const hasJobUrl = typeof job.url === "string" && job.url.includes("/jobs/");
    const hasDescription =
      !!job.description &&
      typeof job.description === "object" &&
      (typeof job.description.role === "string" ||
        typeof job.description.company === "string");
    const hasStructuredJobFields =
      Array.isArray(job.locations) ||
      Array.isArray(job.workLocations) ||
      !!job.department ||
      !!job.employmentType;

    return hasJobUrl || hasDescription || hasStructuredJobFields;
  }

  private extractCompensation(
    payRangeDetails?: RipplingPayRangeDetail[] | null,
  ): CompensationDto | null {
    if (!payRangeDetails || payRangeDetails.length === 0) return null;

    const detail = payRangeDetails[0];
    if (detail.min_value == null && detail.max_value == null) return null;

    const rawInterval = detail.interval?.toLowerCase() ?? "";
    const interval = getCompensationInterval(rawInterval);

    return new CompensationDto({
      interval: interval ?? undefined,
      minAmount: detail.min_value ?? undefined,
      maxAmount: detail.max_value ?? undefined,
      currency: detail.currency ?? "USD",
    });
  }
}
