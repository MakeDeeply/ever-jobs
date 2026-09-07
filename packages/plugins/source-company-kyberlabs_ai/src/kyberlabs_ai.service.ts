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
import { createHttpClient } from '@ever-jobs/common';
import {
  KYBERLABS_AI_CAREERS_URL,
  KYBERLABS_AI_COMPANY_NAME,
  KYBERLABS_AI_DEFAULT_RESULTS,
  KYBERLABS_AI_DEFAULT_TIMEOUT_SECONDS,
  KYBERLABS_AI_ORIGIN,
} from './kyberlabs_ai.constants';

@SourcePlugin({
  site: Site.KYBERLABS_AI,
  name: 'Kyber Labs',
  category: 'company',
  companyDomains: ['kyberlabs.ai'],
})
@Injectable()
export class KyberlabsAiService implements IScraper {
  private readonly logger = new Logger(KyberlabsAiService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    try {
      const jobs = await this.fetchJobs(input);
      const out = this.applyInput(jobs, input);
      this.logger.log(`KyberlabsAi: scraped ${out.length} jobs`);
      return new JobResponseDto(out);
    } catch (error: unknown) {
      const diagnostics = classifyScrapeError(error);
      this.logger.error(
        `KyberlabsAi scrape failed [${diagnostics.reason}]: ${diagnostics.detail ?? this.errorLabel(error)}`,
      );
      return new JobResponseDto([], diagnostics);
    }
  }

  private async fetchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      requestTimeout: input.requestTimeout ?? KYBERLABS_AI_DEFAULT_TIMEOUT_SECONDS,
    });

    const fetchUrl = input.companyUrl || KYBERLABS_AI_CAREERS_URL;
    const companyUrl = input.companyUrl || KYBERLABS_AI_ORIGIN;
    const res = await client.get<string>(fetchUrl);
    const $ = cheerio.load(res.data);
    return this.parsePage($, companyUrl, fetchUrl);
  }

  private parsePage(
    $: cheerio.CheerioAPI,
    companyUrl: string,
    jobUrl: string,
  ): JobPostDto[] {
    const jobs: JobPostDto[] = [];
    const seen = new Set<string>();

    $('h2[data-aid="FLEX_HEADING"]').each((_: number, el: any) => {
      const $heading = $(el);
      const title = this.normalize($heading.text());
      if (!title) {
        return;
      }

      const $section = $heading.closest('section[data-ux="Section"]');
      const $rich = $section.find('div[data-aid="FLEX_RICHTEXT"]').first();
      const $cta = $section.find('a[data-aid="FLEX_CTA_BTN"]').first();
      const richText = this.normalize($rich.text());
      const applyUrl = this.resolveUrl($cta.attr('href') ?? '', companyUrl);
      if (!applyUrl) {
        return;
      }

      const id = `kyberlabs_ai-${this.slugify(title)}`;
      if (seen.has(id)) {
        return;
      }
      seen.add(id);

      const { isRemote, workFromHomeType } = this.parseWorkplace(richText);
      const jobTypes = this.buildJobTypes(richText, title);
      const employmentType = this.buildEmploymentType(jobTypes);
      const location = this.parseLocation(richText);

      jobs.push(
        new JobPostDto({
          id,
          site: Site.KYBERLABS_AI,
          title,
          companyName: KYBERLABS_AI_COMPANY_NAME,
          companyUrl,
          jobUrl,
          jobUrlDirect: jobUrl,
          applyUrl,
          location,
          isRemote,
          workFromHomeType: workFromHomeType ?? undefined,
          jobType: jobTypes,
          employmentType,
        }),
      );
    });

    return jobs;
  }

  private parseLocation(text: string | null): LocationDto | null {
    if (!text) {
      return null;
    }
    const normalized = this.normalize(text);
    const match = normalized.match(/^([^,]+?)\s*,\s*([A-Za-z]{2})\b/);
    if (match) {
      return new LocationDto({
        city: this.normalize(match[1]),
        state: match[2].toUpperCase(),
        country: Country.USA,
      });
    }
    return new LocationDto({ city: normalized, country: Country.USA });
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
    if (
      /\bon[- ]?site\b/.test(lower) ||
      lower.includes('in office') ||
      lower.includes('in person')
    ) {
      return { isRemote: false, workFromHomeType: 'On Site' };
    }
    return { isRemote: false, workFromHomeType: null };
  }

  private buildJobTypes(text: string | null, title: string): JobType[] {
    const out: JobType[] = [];
    const source = `${text ?? ''} ${title}`;
    const tokens = this.extractJobTypeTokens(source);
    for (const token of tokens) {
      const normalized = token.toLowerCase().replace(/[\s-/]/g, '');
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
      KYBERLABS_AI_DEFAULT_RESULTS,
    );
    return filtered.slice(offset, offset + requested);
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
