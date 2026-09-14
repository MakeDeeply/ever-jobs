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
  PULSESPACE_CAREERS_URL,
  PULSESPACE_COMPANY_NAME,
  PULSESPACE_DEFAULT_RESULTS,
  PULSESPACE_DEFAULT_TIMEOUT_SECONDS,
  PULSESPACE_ORIGIN,
} from './pulsespace.constants';

interface PulsespaceJobRecord {
  title: string;
  location: string;
  jobType: string;
  department: string;
  summary?: string | string[];
  responsibilities?: string | string[];
  basicQualifications?: string | string[];
  preferredQualifications?: string | string[];
  competencies?: string | string[];
  closing?: string | string[];
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
    const bundleUrl = this.resolveBundleUrl($, origin);
    if (!bundleUrl) {
      this.logger.warn('Pulsespace: no main JS bundle found in careers page');
      return [];
    }

    const bundleRes = await client.get<string>(bundleUrl);
    const wve = this.parseWveObject(bundleRes.data);
    if (!wve || typeof wve !== 'object' || Array.isArray(wve)) {
      this.logger.warn('Pulsespace: could not parse careers data from bundle');
      return [];
    }

    const records = Object.entries(wve).sort(([a], [b]) => a.localeCompare(b));
    return records
      .map(([slug, record]) => this.buildJob(slug, record, origin, companyUrl))
      .filter((job): job is JobPostDto => Boolean(job));
  }

  private resolveBundleUrl($: cheerio.CheerioAPI, origin: string): string | null {
    const src = $('script[src*="/assets/index-"][src$=".js"]')
      .first()
      .attr('src');
    if (!src) {
      return null;
    }
    return this.resolveUrl(src, origin);
  }

  private parseWveObject(source: string): unknown {
    const markers = ['const wve=', 'var wve=', 'let wve=', 'wve='];
    for (const marker of markers) {
      const parsed = this.parseJsObjectLiteral(source, marker);
      if (parsed) {
        return parsed;
      }
    }
    return null;
  }

  private parseJsObjectLiteral(source: string, marker: string): unknown {
    const markerIndex = source.indexOf(marker);
    if (markerIndex === -1) {
      return null;
    }
    const start = source.indexOf('{', markerIndex);
    if (start === -1) {
      return null;
    }

    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;
    for (let i = start; i < source.length; i++) {
      const c = source[i];
      if (inString) {
        if (escape) {
          escape = false;
        } else if (c === '\\') {
          escape = true;
        } else if (c === '"') {
          inString = false;
        }
      } else {
        if (c === '"') {
          inString = true;
        } else if (c === '{') {
          depth++;
        } else if (c === '}') {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
    }
    if (end === -1) {
      return null;
    }

    const objectString = source.slice(start, end + 1);
    try {
      const json = this.quoteUnquotedKeys(objectString);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private quoteUnquotedKeys(jsObject: string): string {
    let out = '';
    let inString = false;
    let escape = false;
    let i = 0;
    while (i < jsObject.length) {
      const c = jsObject[i];
      if (inString) {
        out += c;
        if (escape) {
          escape = false;
        } else if (c === '\\') {
          escape = true;
        } else if (c === '"') {
          inString = false;
        }
        i++;
        continue;
      }
      if (c === '"') {
        inString = true;
        out += c;
        i++;
        continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i + 1;
        while (j < jsObject.length && /[A-Za-z0-9_$]/.test(jsObject[j])) {
          j++;
        }
        const ident = jsObject.slice(i, j);
        let k = j;
        while (k < jsObject.length && /\s/.test(jsObject[k])) {
          k++;
        }
        if (jsObject[k] === ':') {
          out += `"${ident}":`;
          i = k + 1;
          continue;
        }
        out += ident;
        i = j;
        continue;
      }
      out += c;
      i++;
    }
    return out;
  }

  private buildJob(
    slug: string,
    record: unknown,
    origin: string,
    companyUrl: string,
  ): JobPostDto | null {
    if (!this.isJobRecord(record)) {
      return null;
    }

    const title = this.normalize(record.title);
    if (!title) {
      return null;
    }

    const jobUrl = this.resolveUrl(`/careers/${slug}`, origin);
    if (!jobUrl) {
      return null;
    }

    const jobTypes = this.buildJobTypes(record.jobType, title);
    const employmentType = this.buildEmploymentType(jobTypes);
    const description = this.buildDescription(record);
    const { isRemote, workFromHomeType } = this.parseWorkFromHomeType(
      [record.location, record.jobType, description].filter((t): t is string => Boolean(t)),
    );
    const location = this.parseLocation(record.location);

    return new JobPostDto({
      id: `pulsespace-${slug}`,
      site: Site.PULSESPACE,
      title,
      companyName: PULSESPACE_COMPANY_NAME,
      companyUrl,
      jobUrl,
      jobUrlDirect: jobUrl,
      location,
      isRemote,
      workFromHomeType: workFromHomeType ?? undefined,
      jobType: jobTypes,
      employmentType,
      department: this.normalize(record.department) || undefined,
      description,
    });
  }

  private isJobRecord(value: unknown): value is PulsespaceJobRecord {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as PulsespaceJobRecord).title === 'string' &&
      typeof (value as PulsespaceJobRecord).location === 'string'
    );
  }

  private buildDescription(record: PulsespaceJobRecord): string {
    const sections: string[] = [];
    const add = (heading: string, body?: string | string[]) => {
      if (body === undefined || body === null) {
        return;
      }
      const parts = Array.isArray(body) ? body : [body];
      const lines = parts.map((p) => `- ${this.normalize(p)}`).filter(Boolean);
      if (lines.length === 0) {
        return;
      }
      sections.push(`## ${heading}\n\n${lines.join('\n\n')}`);
    };

    add('Position Summary', record.summary);
    add('Key Responsibilities', record.responsibilities);
    add('Basic Qualifications', record.basicQualifications);
    add('Preferred Qualifications', record.preferredQualifications);
    add('Competencies', record.competencies);
    if (typeof record.closing === 'string' && record.closing.trim()) {
      sections.push(`## Closing\n\n${this.normalize(record.closing)}`);
    }

    return this.normalize(sections.join('\n\n'));
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
