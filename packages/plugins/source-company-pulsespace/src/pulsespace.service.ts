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
  PULSESPACE_CAREERS_URL,
  PULSESPACE_COMPANY_NAME,
  PULSESPACE_DEFAULT_RESULTS,
  PULSESPACE_DEFAULT_TIMEOUT_SECONDS,
  PULSESPACE_DETAIL_CONCURRENCY,
  PULSESPACE_ORIGIN,
} from './pulsespace.constants';

interface ListingRecord {
  title: string;
  href: string;
  slug: string;
}

interface MetadataParts {
  locationText: string | null;
  employmentText: string | null;
  departmentText: string | null;
}

@SourcePlugin({
  site: Site.PULSESPACE,
  name: 'Pulse Space',
  category: 'company',
  companyDomains: ['pulsespace.com'],
})
@Injectable()
export class PulsespaceService implements IScraper {
  private readonly logger = new Logger(PulsespaceService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    try {
      const jobs = await this.fetchJobs(input);
      const out = this.applyInput(jobs, input);
      this.logger.log(`Pulsespace: scraped ${out.length} jobs`);
      return new JobResponseDto(out);
    } catch (error: unknown) {
      const diagnostics = classifyScrapeError(error);
      this.logger.error(
        `Pulsespace scrape failed [${diagnostics.reason}]: ${diagnostics.detail ?? this.errorLabel(error)}`,
      );
      return new JobResponseDto([], diagnostics);
    }
  }

  private async fetchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      requestTimeout: input.requestTimeout ?? PULSESPACE_DEFAULT_TIMEOUT_SECONDS,
    });

    const fetchUrl = input.companyUrl || PULSESPACE_CAREERS_URL;
    const companyUrl = input.companyUrl || PULSESPACE_ORIGIN;
    const origin = new URL(fetchUrl).origin;
    const listingRes = await client.get<string>(fetchUrl);
    const $ = cheerio.load(listingRes.data);
    const listings = this.parseListings($);

    const jobs: JobPostDto[] = [];
    for (let i = 0; i < listings.length; i += PULSESPACE_DETAIL_CONCURRENCY) {
      const batch = listings.slice(i, i + PULSESPACE_DETAIL_CONCURRENCY);
      const settled = await Promise.allSettled(
        batch.map((record) => this.fetchDetail(client, record, origin, companyUrl)),
      );
      for (const result of settled) {
        if (result.status === 'fulfilled' && result.value) {
          jobs.push(result.value);
        } else if (result.status === 'rejected') {
          this.logger.warn(`Pulsespace detail fetch failed: ${this.errorLabel(result.reason)}`);
        }
      }
    }

    return jobs;
  }

  private parseListings($: cheerio.CheerioAPI): ListingRecord[] {
    const listings: ListingRecord[] = [];
    const seen = new Set<string>();

    $('a[href^="/careers/"]').each((_: number, el: any) => {
      const $a = $(el);
      const href = this.normalize($a.attr('href') ?? '');
      if (!/^\/careers\/[^/]+$/.test(href)) {
        return;
      }

      const slug = href.split('/').pop() ?? '';
      if (!slug) {
        return;
      }

      const title = this.normalize($a.text());
      if (!title) {
        return;
      }

      const id = `pulsespace-${slug}`;
      if (seen.has(id)) {
        return;
      }
      seen.add(id);

      listings.push({
        title,
        href,
        slug,
      });
    });

    return listings;
  }

  private async fetchDetail(
    client: HttpClient,
    record: ListingRecord,
    origin: string,
    companyUrl: string,
  ): Promise<JobPostDto | null> {
    const detailUrl = this.resolveUrl(record.href, origin);
    if (!detailUrl) {
      return null;
    }

    const res = await client.get<string>(detailUrl);
    const $ = cheerio.load(res.data);

    const $h1 = $('main h1, h1').first();
    const title = this.normalize($h1.text()) || record.title;

    const $container = $('main').first().children('div').first();
    const metadata = this.parseMetadata($, $container);

    const description = this.extractDescription($, $container);

    const jobTypes = this.buildJobTypes(metadata.employmentText, title);
    const employmentType = this.buildEmploymentType(jobTypes);
    const { isRemote, workFromHomeType } = this.parseWorkFromHomeType(
      [metadata.locationText, metadata.employmentText, description].filter((t): t is string => Boolean(t)),
    );
    const location = this.parseLocation(metadata.locationText);

    const id = `pulsespace-${record.slug}`;

    return new JobPostDto({
      id,
      site: Site.PULSESPACE,
      title,
      companyName: PULSESPACE_COMPANY_NAME,
      companyUrl,
      jobUrl: detailUrl,
      jobUrlDirect: detailUrl,
      location,
      isRemote,
      workFromHomeType: workFromHomeType ?? undefined,
      jobType: jobTypes,
      employmentType,
      department: metadata.departmentText ?? undefined,
      description,
    });
  }

  private parseMetadata($: cheerio.CheerioAPI, $container: cheerio.Cheerio<any>): MetadataParts {
    const result: MetadataParts = {
      locationText: null,
      employmentText: null,
      departmentText: null,
    };

    const $h1 = $container.find('h1').first();
    const $metaDiv = $h1.next('div');
    const spans = $metaDiv
      .find('span')
      .map((_: number, el: any) => this.normalize($(el).text()))
      .get()
      .filter(Boolean);

    for (const text of spans) {
      const lower = text.toLowerCase();
      if (getJobTypeFromString(lower)) {
        result.employmentText = text;
        continue;
      }
      if (/,\s*[A-Za-z]{2}\b/.test(text) || /\b[A-Za-z]+,\s*[A-Za-z]{2}\b/.test(text)) {
        result.locationText = text;
        continue;
      }
      result.departmentText = text;
    }

    return result;
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

  private extractDescription($: cheerio.CheerioAPI, $container: cheerio.Cheerio<any>): string {
    const parts: string[] = [];

    $container.children('div').each((_: number, el: any) => {
      const $section = $(el);
      const $h2 = $section.find('h2').first();
      if ($h2.length) {
        const heading = this.normalize($h2.text());
        const bodyHtml = $h2
          .nextAll()
          .toArray()
          .map((node) => $.html(node))
          .join('');
        const body = this.htmlToText(bodyHtml);
        if (heading || body) {
          parts.push(`## ${heading}\n\n${body}`);
        }
      }
    });

    $container.children('p').each((_: number, el: any) => {
      const text = this.normalize($(el).text());
      if (text) {
        parts.push(text);
      }
    });

    return this.normalize(parts.join('\n\n'));
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
    return `${base}/${trimmed}`;
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
      PULSESPACE_DEFAULT_RESULTS,
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
