import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
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
import { BrowserPool } from '@ever-jobs/common';
import type { Page } from 'playwright';
import {
  PULSESPACE_CAREERS_URL,
  PULSESPACE_COMPANY_NAME,
  PULSESPACE_DEFAULT_RESULTS,
  PULSESPACE_DEFAULT_TIMEOUT_SECONDS,
  PULSESPACE_DETAIL_SELECTOR,
  PULSESPACE_LIST_SELECTOR,
  PULSESPACE_ORIGIN,
  PULSESPACE_READY_TIMEOUT_SECONDS,
} from './pulsespace.constants';

interface PulsespaceDetail {
  title: string;
  subtitle: string;
  locationText: string;
  jobTypeText: string;
  departmentText: string;
  description: string;
}

@SourcePlugin({
  site: Site.PULSESPACE,
  name: 'Pulse Space',
  category: 'company',
  companyDomains: ['pulsespace.com'],
})
@Injectable()
export class PulsespaceService implements IScraper, OnModuleDestroy {
  private readonly logger = new Logger(PulsespaceService.name);

  async onModuleDestroy(): Promise<void> {
    await BrowserPool.close().catch(() => undefined);
  }

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
    const proxy = input.proxies?.[0];
    const timeoutMs =
      (input.requestTimeout ?? PULSESPACE_DEFAULT_TIMEOUT_SECONDS) * 1000;

    const page = await BrowserPool.getPage({
      proxy,
      stealth: true,
      headful: true,
    });

    try {
      const startUrl = input.companyUrl || PULSESPACE_CAREERS_URL;
      const origin = new URL(startUrl).origin;
      const companyUrl = input.companyUrl
        ? new URL(input.companyUrl).origin
        : PULSESPACE_ORIGIN;

      const listHtml = await this.fetchHtml(
        startUrl,
        page,
        timeoutMs,
        PULSESPACE_LIST_SELECTOR,
      );
      const detailUrls = this.parseListLinks(listHtml, origin);
      if (detailUrls.length === 0) {
        this.logger.warn('Pulsespace: no /careers/<slug> links rendered');
        return [];
      }

      const jobs: JobPostDto[] = [];
      for (const detailUrl of detailUrls) {
        const detailHtml = await this.fetchHtml(
          detailUrl,
          page,
          timeoutMs,
          PULSESPACE_DETAIL_SELECTOR,
        );
        const job = this.buildJob(detailUrl, detailHtml, companyUrl);
        if (job) {
          jobs.push(job);
        }
      }
      return jobs;
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  protected async fetchHtml(
    url: string,
    page?: Page,
    timeoutMs?: number,
    waitSelector?: string,
  ): Promise<string> {
    const timeout = timeoutMs ?? PULSESPACE_DEFAULT_TIMEOUT_SECONDS * 1000;
    const ready = waitSelector ?? 'main';

    if (page) {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
      await page
        .waitForSelector(ready, {
          timeout: PULSESPACE_READY_TIMEOUT_SECONDS * 1000,
        })
        .catch(() => undefined);
      return page.content();
    }

    const p = await BrowserPool.getPage({ stealth: true, headful: true });
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout });
      await p
        .waitForSelector(ready, {
          timeout: PULSESPACE_READY_TIMEOUT_SECONDS * 1000,
        })
        .catch(() => undefined);
      return p.content();
    } finally {
      await p.close().catch(() => undefined);
    }
  }

  private parseListLinks(html: string, origin: string): string[] {
    const $ = cheerio.load(html);
    const seen = new Set<string>();
    const urls: string[] = [];

    $('a[href]').each((_i, el) => {
      const href = $(el).attr('href')?.trim() ?? '';
      if (!/^\/careers\/[^/?#]+/.test(href) && !/^https?:\/\/[^/]+\/careers\/[^/?#]+/.test(href)) {
        return;
      }
      const url = this.resolveUrl(href, origin);
      if (url && !seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    });

    return urls;
  }

  private parseDetail(html: string): PulsespaceDetail | null {
    const $ = cheerio.load(html);
    const found = $('main').first();
    const main = (found.length ? found : $('html').first()) as cheerio.Cheerio<any>;

    const title = this.normalize(main.find('h1').first().text());
    if (!title) {
      return null;
    }

    const subtitle = this.normalize(
      main.find('h1').first().nextAll('p').first().text(),
    );

    // Icon badges: each span pairs a lucide svg with its text. Order on the
    // page is location, employment type, department — the svg class names are
    // the stable signal.
    let locationText = '';
    let jobTypeText = '';
    let departmentText = '';
    const fallback: string[] = [];
    main.find('span').each((_i, el) => {
      const span = $(el);
      const svgClass = span.find('svg').first().attr('class') ?? '';
      const text = this.normalize(span.clone().children().remove().end().text())
        || this.normalize(span.text());
      if (!text || !svgClass) {
        return;
      }
      fallback.push(text);
      if (/map-pin/i.test(svgClass)) {
        locationText = locationText || text;
      } else if (/briefcase/i.test(svgClass)) {
        jobTypeText = jobTypeText || text;
      } else if (/building2|building/i.test(svgClass)) {
        departmentText = departmentText || text;
      }
    });
    if (!locationText && fallback.length > 0) {
      locationText = fallback[0];
    }
    if (!jobTypeText && fallback.length > 1) {
      jobTypeText = fallback[1];
    }
    if (!departmentText && fallback.length > 2) {
      departmentText = fallback[2];
    }

    // Body: each h2 heads a section whose container holds paragraphs or a ul.
    const sections: string[] = [];
    if (subtitle) {
      sections.push(subtitle);
    }
    main.find('h2').each((_i, el) => {
      const heading = this.normalize($(el).text());
      if (!heading) {
        return;
      }
      const container = $(el).next();
      const items: string[] = [];
      container.find('li').each((_j, li) => {
        const text = this.normalize($(li).text());
        if (text) {
          items.push(`- ${text}`);
        }
      });
      if (items.length === 0) {
        container.find('p').each((_j, p) => {
          const text = this.normalize($(p).text());
          if (text) {
            items.push(text);
          }
        });
      }
      if (items.length > 0) {
        sections.push(`## ${heading}\n\n${items.join('\n\n')}`);
      }
    });

    return {
      title,
      subtitle,
      locationText,
      jobTypeText,
      departmentText,
      description: sections.join('\n\n'),
    };
  }

  private buildJob(
    detailUrl: string,
    html: string,
    companyUrl: string,
  ): JobPostDto | null {
    const detail = this.parseDetail(html);
    if (!detail) {
      return null;
    }

    const slugMatch = detailUrl.match(/\/careers\/([^/?#]+)/);
    const slug = slugMatch ? slugMatch[1] : this.slugify(detail.title);
    if (!slug) {
      return null;
    }

    const jobTypes = this.buildJobTypes(detail.jobTypeText, detail.title);
    const employmentType = this.buildEmploymentType(jobTypes);
    const { isRemote, workFromHomeType } = this.parseWorkFromHomeType(
      [detail.locationText, detail.jobTypeText, detail.description].filter(
        (t): t is string => Boolean(t),
      ),
    );
    const location = this.parseLocation(detail.locationText);

    return new JobPostDto({
      id: `pulsespace-${slug}`,
      site: Site.PULSESPACE,
      title: detail.title,
      companyName: PULSESPACE_COMPANY_NAME,
      companyUrl,
      jobUrl: detailUrl,
      jobUrlDirect: detailUrl,
      location,
      isRemote,
      workFromHomeType: workFromHomeType ?? undefined,
      jobType: jobTypes,
      employmentType,
      department: detail.departmentText || undefined,
      description: detail.description,
    });
  }

  private slugify(text: string): string {
    return this.normalize(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
