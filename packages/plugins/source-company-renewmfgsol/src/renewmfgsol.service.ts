import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { SourcePlugin } from '@ever-jobs/plugin';
import {
  classifyScrapeError,
  Country,
  getJobTypeFromString,
  IScraper,
  JobPostDto,
  JobResponseDto,
  JobType,
  LocationDto,
  ScraperInputDto,
  Site,
} from '@ever-jobs/models';
import { createHttpClient, HttpClient } from '@ever-jobs/common';
import {
  RENEWMFGSOL_CAREERS_URL,
  RENEWMFGSOL_COMPANY_NAME,
  RENEWMFGSOL_DEFAULT_RESULTS,
  RENEWMFGSOL_DEFAULT_TIMEOUT_SECONDS,
  RENEWMFGSOL_DETAIL_CONCURRENCY,
  RENEWMFGSOL_ORIGIN,
} from './renewmfgsol.constants';

interface ListingRecord {
  title: string;
  locationText: string;
  applyUrl: string;
  slug: string;
  isInternal: boolean;
}

interface DetailParts {
  title: string;
  description: string | null;
}

@SourcePlugin({
  site: Site.RENEWMFGSOL,
  name: 'ReNEW Manufacturing Solutions',
  category: 'company',
  companyDomains: ['renewmfgsol.com'],
})
@Injectable()
export class RenewmfgsolService implements IScraper {
  private readonly logger = new Logger(RenewmfgsolService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    try {
      const jobs = await this.fetchJobs(input);
      const out = this.applyInput(jobs, input);
      this.logger.log(`Renewmfgsol: scraped ${out.length} jobs`);
      return new JobResponseDto(out);
    } catch (error: unknown) {
      const diagnostics = classifyScrapeError(error);
      this.logger.error(
        `Renewmfgsol scrape failed [${diagnostics.reason}]: ${diagnostics.detail ?? this.errorLabel(error)}`,
      );
      return new JobResponseDto([], diagnostics);
    }
  }

  private async fetchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      requestTimeout: input.requestTimeout ?? RENEWMFGSOL_DEFAULT_TIMEOUT_SECONDS,
    });

    const fetchUrl = input.companyUrl || RENEWMFGSOL_CAREERS_URL;
    const companyUrl = input.companyUrl || RENEWMFGSOL_ORIGIN;
    const origin = new URL(fetchUrl).origin;
    const listingUrl = new URL(fetchUrl).href;

    const listingRes = await client.get<string>(fetchUrl);
    const $ = cheerio.load(listingRes.data);
    const listings = this.parseListings($, origin);

    const jobs: JobPostDto[] = [];
    for (let i = 0; i < listings.length; i += RENEWMFGSOL_DETAIL_CONCURRENCY) {
      const batch = listings.slice(i, i + RENEWMFGSOL_DETAIL_CONCURRENCY);
      const settled = await Promise.allSettled(
        batch.map((record) => this.buildJob(client, record, origin, companyUrl, listingUrl)),
      );
      for (const result of settled) {
        if (result.status === 'fulfilled' && result.value) {
          jobs.push(result.value);
        } else if (result.status === 'rejected') {
          this.logger.warn(`Renewmfgsol detail fetch failed: ${this.errorLabel(result.reason)}`);
        }
      }
    }

    return jobs;
  }

  private parseListings($: cheerio.CheerioAPI, origin: string): ListingRecord[] {
    const listings: ListingRecord[] = [];
    const seen = new Set<string>();

    $('.atmc-career-01_box').each((_: number, el: any) => {
      const $card = $(el);
      const title = this.normalize($card.find('h4').first().text());
      const locationText = this.normalize($card.find('p.atmc-cap').first().text());
      const applyHref = this.normalize($card.find('a.atmc-btn').first().attr('href') ?? '');

      if (!title || !applyHref) {
        return;
      }

      const applyUrl = this.resolveUrl(applyHref, origin);
      if (!applyUrl) {
        return;
      }

      const slug = this.slugify(title);
      const id = `renewmfgsol-${slug}`;
      if (seen.has(id)) {
        return;
      }
      seen.add(id);

      listings.push({
        title,
        locationText,
        applyUrl,
        slug,
        isInternal: applyUrl.startsWith(origin),
      });
    });

    return listings;
  }

  private async buildJob(
    client: HttpClient,
    record: ListingRecord,
    origin: string,
    companyUrl: string,
    listingUrl: string,
  ): Promise<JobPostDto | null> {
    let description: string | null = null;
    const jobUrl = record.isInternal ? record.applyUrl : listingUrl;

    if (record.isInternal) {
      try {
        const detailRes = await client.get<string>(record.applyUrl);
        const $detail = cheerio.load(detailRes.data);
        const detailParts = this.parseDetail($detail, record.title);
        description = detailParts.description;
      } catch (error: unknown) {
        this.logger.warn(
          `Renewmfgsol detail fetch failed for ${record.applyUrl}: ${this.errorLabel(error)}`,
        );
      }
    }

    const jobTypes = this.buildJobTypes(description, record.title);
    const employmentType = this.buildEmploymentType(jobTypes);
    const { isRemote, workFromHomeType } = this.parseWorkFromHomeType(
      [record.locationText, description].filter((t): t is string => Boolean(t)),
    );
    const location = this.parseLocation(record.locationText);

    const id = `renewmfgsol-${record.slug}`;

    return new JobPostDto({
      id,
      site: Site.RENEWMFGSOL,
      title: record.title,
      companyName: RENEWMFGSOL_COMPANY_NAME,
      companyUrl,
      jobUrl,
      jobUrlDirect: jobUrl,
      location,
      isRemote,
      workFromHomeType: workFromHomeType ?? undefined,
      jobType: jobTypes,
      employmentType,
      applyUrl: record.applyUrl,
      description,
    });
  }

  private parseDetail($: cheerio.CheerioAPI, fallbackTitle: string): DetailParts {
    const ogDescription = this.normalize(
      $('meta[property="og:description"]').attr('content') ?? '',
    );
    const metaDescription = this.normalize(
      $('meta[name="description"]').attr('content') ?? '',
    );

    let description = ogDescription || metaDescription || null;
    if (!description) {
      const $main = $('#main-content');
      if ($main.length) {
        description = this.normalize(this.htmlToText($.html($main)));
      }
    }

    const title =
      this.normalize($('meta[property="og:title"]').attr('content') ?? '') || fallbackTitle;

    return { title, description };
  }

  private parseWorkFromHomeType(texts: string[]): {
    isRemote: boolean;
    workFromHomeType: string | null;
  } {
    const source = texts.join(' ').toLowerCase();
    if (source.includes('hybrid')) {
      return { isRemote: false, workFromHomeType: 'Hybrid' };
    }
    if (/\bremote\b/.test(source)) {
      return { isRemote: true, workFromHomeType: 'Remote' };
    }
    if (/\b(?:on[- ]?site|in[- ]?person|in[- ]?office)\b/.test(source)) {
      return { isRemote: false, workFromHomeType: 'On Site' };
    }
    return { isRemote: false, workFromHomeType: null };
  }

  private buildJobTypes(text: string | null, title: string): JobType[] {
    const out: JobType[] = [];
    const source = `${text ?? ''} ${title}`;
    const tokens = this.extractJobTypeTokens(source);
    for (const token of tokens) {
      const normalized = token.toLowerCase().replace(/[\s/-]/g, '');
      const jobType = getJobTypeFromString(
        normalized === 'intern' ? 'internship' : normalized,
      );
      if (jobType && !out.includes(jobType)) {
        out.push(jobType);
      }
    }
    if (out.length === 0) {
      out.push(JobType.FULL_TIME);
    }
    return out;
  }

  private extractJobTypeTokens(text: string): string[] {
    const matches = text.match(
      /\b(?:full[- ]?time|part[- ]?time|contract(?:or)?|temporary|intern(?:ship)?|freelance|per[- ]?diem)\b/gi,
    );
    return matches ?? [];
  }

  private buildEmploymentType(jobTypes: JobType[]): string {
    if (jobTypes.length === 1) {
      switch (jobTypes[0]) {
        case JobType.FULL_TIME:
          return 'Full time';
        case JobType.PART_TIME:
          return 'Part time';
        case JobType.CONTRACT:
          return 'Contract';
        case JobType.TEMPORARY:
          return 'Temporary';
        case JobType.INTERNSHIP:
          return 'Internship';
        default:
          return 'Full time';
      }
    }
    return jobTypes.map((jobType) => this.jobTypeLabel(jobType)).join(' | ');
  }

  private jobTypeLabel(jobType: JobType): string {
    switch (jobType) {
      case JobType.FULL_TIME:
        return 'Full time';
      case JobType.PART_TIME:
        return 'Part time';
      case JobType.CONTRACT:
        return 'Contract';
      case JobType.TEMPORARY:
        return 'Temporary';
      case JobType.INTERNSHIP:
        return 'Internship';
      case JobType.PER_DIEM:
        return 'Per diem';
      case JobType.NIGHTS:
        return 'Nights';
      case JobType.OTHER:
        return 'Other';
      case JobType.SUMMER:
        return 'Summer';
      case JobType.VOLUNTEER:
        return 'Volunteer';
      default:
        return String(jobType);
    }
  }

  private parseLocation(text: string | null): LocationDto | null {
    if (!text) {
      return null;
    }
    const normalized = this.normalize(text);
    const match = normalized.match(/^([^,]+?)\s*,\s*([A-Za-z]{2})\b/);
    if (match) {
      return new LocationDto({
        city: this.toTitleCase(this.normalize(match[1])),
        state: match[2].toUpperCase(),
        country: Country.USA,
      });
    }
    return new LocationDto({ city: normalized, country: Country.USA });
  }

  private htmlToText(html: string): string {
    let text = html.replace(/<(a|span|strong|em|b|i|u|small|sub|sup|label|time)(?:\s[^>]*)?>/gi, ' ');
    text = text.replace(/<\/(a|span|strong|em|b|i|u|small|sub|sup|label|time)>/gi, ' ');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/li>/gi, '\n');
    text = text.replace(/<li[^>]*>/gi, '- ');
    text = text.replace(/<[^>]*>/g, ' ');
    return this.normalize(text);
  }

  private resolveUrl(href: string, origin: string): string | null {
    const trimmed = this.normalize(href);
    if (!trimmed) {
      return null;
    }
    if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
      return trimmed;
    }
    const base = origin.replace(/\/$/, '');
    if (trimmed.startsWith('/')) {
      return `${base}${trimmed}`;
    }
    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }
    return `${base}/${trimmed}`;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private applyInput(jobs: JobPostDto[], input: ScraperInputDto): JobPostDto[] {
    let filtered = jobs;

    const searchTerm = this.normalize(input.searchTerm).toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter((job) =>
        [job.title, job.description].some((value) =>
          this.normalize(value).toLowerCase().includes(searchTerm),
        ),
      );
    }

    const locationTerm = this.normalize(input.location).toLowerCase();
    if (locationTerm) {
      filtered = filtered.filter((job) =>
        this.normalize(job.location?.displayLocation())
          .toLowerCase()
          .includes(locationTerm),
      );
    }

    if (input.isRemote === true) {
      filtered = filtered.filter((job) => job.isRemote === true);
    }

    if (input.jobType) {
      filtered = filtered.filter((job) =>
        job.jobType?.includes(input.jobType as JobType),
      );
    }

    const offset = this.nonNegativeInt(input.offset, 0);
    const requested = this.nonNegativeInt(
      input.resultsWanted,
      RENEWMFGSOL_DEFAULT_RESULTS,
    );
    return filtered.slice(offset, offset + requested);
  }

  private toTitleCase(value: string): string {
    return value
      .toLowerCase()
      .split(/([\s\-]+)/)
      .map((part) => (part.match(/^[\s\-]+$/) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
      .join('');
  }

  private normalize(value: unknown): string {
    return typeof value === 'string'
      ? value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
      : '';
  }

  private nonNegativeInt(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? Math.floor(value)
      : fallback;
  }

  private errorLabel(error: unknown): string {
    if (!error || typeof error !== 'object') {
      return 'unknown error';
    }
    const status = (error as { response?: { status?: unknown } }).response
      ?.status;
    if (typeof status === 'number') {
      return `HTTP ${status}`;
    }
    const name = (error as { name?: unknown }).name;
    return typeof name === 'string' && name ? name : 'request error';
  }
}
