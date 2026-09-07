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
  CASCADE_SPACE_APPLY_EMAIL,
  CASCADE_SPACE_CAREERS_URL,
  CASCADE_SPACE_COMPANY_NAME,
  CASCADE_SPACE_DEFAULT_RESULTS,
  CASCADE_SPACE_DEFAULT_TIMEOUT_SECONDS,
  CASCADE_SPACE_DETAIL_CONCURRENCY,
  CASCADE_SPACE_ORIGIN,
} from './cascade_space.constants';

interface ListingRecord {
  title: string;
  tagline: string;
  href: string;
}

@SourcePlugin({
  site: Site.CASCADE_SPACE,
  name: 'Cascade Space',
  category: 'company',
  companyDomains: ['cascade.space', 'cascadespace.com'],
})
@Injectable()
export class CascadeSpaceService implements IScraper {
  private readonly logger = new Logger(CascadeSpaceService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    try {
      const jobs = await this.fetchJobs(input);
      const out = this.applyInput(jobs, input);
      this.logger.log(`CascadeSpace: scraped ${out.length} jobs`);
      return new JobResponseDto(out);
    } catch (error: unknown) {
      const diagnostics = classifyScrapeError(error);
      this.logger.error(
        `CascadeSpace scrape failed [${diagnostics.reason}]: ${diagnostics.detail ?? this.errorLabel(error)}`,
      );
      return new JobResponseDto([], diagnostics);
    }
  }

  private async fetchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      requestTimeout: input.requestTimeout ?? CASCADE_SPACE_DEFAULT_TIMEOUT_SECONDS,
    });

    const fetchUrl = input.companyUrl || CASCADE_SPACE_CAREERS_URL;
    const companyUrl = input.companyUrl || CASCADE_SPACE_CAREERS_URL;
    const origin = new URL(fetchUrl).origin;
    const listingRes = await client.get<string>(fetchUrl);
    const $ = cheerio.load(listingRes.data);
    const listings = this.parseListings($);

    const jobs: JobPostDto[] = [];
    for (let i = 0; i < listings.length; i += CASCADE_SPACE_DETAIL_CONCURRENCY) {
      const batch = listings.slice(i, i + CASCADE_SPACE_DETAIL_CONCURRENCY);
      const settled = await Promise.allSettled(
        batch.map((record) => this.fetchDetail(client, record, origin, companyUrl)),
      );
      for (const result of settled) {
        if (result.status === 'fulfilled' && result.value) {
          jobs.push(result.value);
        } else if (result.status === 'rejected') {
          this.logger.warn(`CascadeSpace detail fetch failed: ${this.errorLabel(result.reason)}`);
        }
      }
    }

    return jobs;
  }

  private parseListings($: cheerio.CheerioAPI): ListingRecord[] {
    const listings: ListingRecord[] = [];
    const seen = new Set<string>();

    $('h3').each((_: number, el: any) => {
      const $h3 = $(el);
      const title = this.normalize($h3.text());
      if (!title) {
        return;
      }

      const $card = $h3.parent();
      const $tagline = $h3.nextAll('div').first();
      const $detail = $tagline.nextAll('a').first();
      const href = $detail.attr('href') ?? '';
      if (!/^\/careers\/[^/]+/.test(href)) {
        return;
      }

      const id = `cascade_space-${this.slugify(title)}`;
      if (seen.has(id)) {
        return;
      }
      seen.add(id);

      const tagline = this.normalize($tagline.text());

      listings.push({
        title,
        tagline,
        href: href.trim(),
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

    const $h1 = $('h1').first();
    const title = this.normalize($h1.text()) || record.title;

    const $article = $('article').first();
    const description = $article.length ? this.extractDescription($article) : '';

    const mailto = $('a[href^="mailto:"]').first().attr('href') ?? '';
    const applyEmail = this.extractEmail(mailto) || CASCADE_SPACE_APPLY_EMAIL;
    const applyUrl = `mailto:${applyEmail}`;

    const id = `cascade_space-${this.slugify(title)}`;
    const taglineParts = this.parseTagline(record.tagline);
    const jobTypes = this.buildJobTypes(taglineParts.employmentText, title);
    const employmentType = this.buildEmploymentType(jobTypes);
    const { isRemote, workFromHomeType } = this.parseWorkplace(
      taglineParts.workplaceText,
    );
    const location = this.parseLocation(taglineParts.locationText);

    return new JobPostDto({
      id,
      site: Site.CASCADE_SPACE,
      title,
      companyName: CASCADE_SPACE_COMPANY_NAME,
      companyUrl,
      jobUrl: detailUrl,
      jobUrlDirect: detailUrl,
      applyUrl,
      emails: [applyEmail],
      description,
      location,
      isRemote,
      workFromHomeType: workFromHomeType ?? undefined,
      jobType: jobTypes,
      employmentType,
    });
  }

  private parseTagline(tagline: string): {
    employmentText: string | null;
    workplaceText: string | null;
    locationText: string | null;
  } {
    let employmentText: string | null = null;
    let workplaceText: string | null = null;
    let locationText: string | null = null;

    const normalized = this.normalize(tagline).replace(/\s*•\s*/g, ' • ');
    const parts = normalized
      .split(' • ')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const part of parts) {
      const lower = part.toLowerCase();
      const jobType = getJobTypeFromString(
        lower.replace(/[\s/-]/g, '').replace(/^intern$/, 'internship'),
      );
      if (jobType) {
        employmentText = part;
        continue;
      }
      if (/\b(?:on[- ]?site|remote|hybrid)\b/.test(lower)) {
        workplaceText = part;
        continue;
      }
      if (/[,;]/.test(part) || /\b[a-z\s]+,?\s+[a-z]{2}\b/i.test(part)) {
        locationText = part;
      }
    }

    return { employmentText, workplaceText, locationText };
  }

  private parseWorkplace(text: string | null): {
    isRemote: boolean;
    workFromHomeType: string | null;
  } {
    if (!text) {
      return { isRemote: false, workFromHomeType: null };
    }
    const lower = text.toLowerCase();
    if (lower.includes('hybrid')) {
      return { isRemote: false, workFromHomeType: 'Hybrid' };
    }
    if (/\bremote\b/.test(lower)) {
      return { isRemote: true, workFromHomeType: 'Remote' };
    }
    if (/\b(?:on[- ]?site|in[- ]?office|in[- ]?person)\b/.test(lower)) {
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

  private extractDescription($article: cheerio.Cheerio<any>): string {
    let html = $article.html() ?? '';
    html = html.replace(/<(a|span|strong|em|b|i|u|small|sub|sup|label|time)(?:\s[^>]*)?>/gi, ' ');
    html = html.replace(/<\/(a|span|strong|em|b|i|u|small|sub|sup|label|time)>/gi, ' ');
    html = html.replace(/<br\s*\/?>/gi, '\n');
    html = html.replace(/<[^>]*>/g, ' ');
    return this.normalize(html);
  }

  private extractEmail(mailto: string): string | null {
    const m = mailto.match(/^mailto:(.+)$/i);
    if (!m) {
      return null;
    }
    const email = m[1].split('?')[0].trim();
    return email || null;
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

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
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
      CASCADE_SPACE_DEFAULT_RESULTS,
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
