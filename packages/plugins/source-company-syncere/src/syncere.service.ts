import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { SourcePlugin } from '@ever-jobs/plugin';
import {
  classifyScrapeError,
  Country,
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
  SYNCERE_CAREERS_URL,
  SYNCERE_COMPANY_NAME,
  SYNCERE_DEFAULT_RESULTS,
  SYNCERE_DEFAULT_TIMEOUT_SECONDS,
  SYNCERE_ORIGIN,
} from './syncere.constants';
import { SyncerePage, SyncereSearchIndex } from './syncere.types';

const SECTION_HEADERS = [
  'About the Role :',
  "What You'll Do :",
  "What We're Looking For :",
  'Nice to Have :',
  'Details :',
  'How to Apply :',
];

@SourcePlugin({
  site: Site.SYNCERE,
  name: 'Syncere',
  category: 'company',
  companyDomains: ['syncere.com', 'www.syncere.com'],
})
@Injectable()
export class SyncereService implements IScraper {
  private readonly logger = new Logger(SyncereService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    try {
      const jobs = await this.fetchJobs(input);
      const out = this.applyInput(jobs, input);
      this.logger.log(`Syncere: scraped ${out.length} jobs`);
      return new JobResponseDto(out);
    } catch (error: unknown) {
      const diagnostics = classifyScrapeError(error);
      this.logger.error(
        `Syncere scrape failed [${diagnostics.reason}]: ${diagnostics.detail ?? this.errorLabel(error)}`,
      );
      return new JobResponseDto([], diagnostics);
    }
  }

  private async fetchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      requestTimeout: input.requestTimeout ?? SYNCERE_DEFAULT_TIMEOUT_SECONDS,
    });

    const startUrl = input.companyUrl || SYNCERE_CAREERS_URL;
    const htmlRes = await client.get<string>(startUrl);
    const $ = cheerio.load(htmlRes.data);
    const indexUrl = $('meta[name="framer-search-index"]').attr('content')?.trim();
    if (!indexUrl) {
      throw new Error('Syncere careers page is missing the Framer search-index meta tag');
    }

    const jsonRes = await client.get<SyncereSearchIndex>(indexUrl);
    const index = jsonRes.data ?? {};
    return this.parseIndex(input, index);
  }

  private parseIndex(input: ScraperInputDto, index: SyncereSearchIndex): JobPostDto[] {
    const companyUrl = input.companyUrl || SYNCERE_CAREERS_URL;
    const jobs: JobPostDto[] = [];
    for (const [path, page] of Object.entries(index)) {
      if (!this.isJobPage(page)) continue;
      const job = this.toJobPost(path, page, companyUrl);
      if (job) jobs.push(job);
    }
    return jobs;
  }

  private isJobPage(page: SyncerePage): boolean {
    return page.p?.some((s) => this.normalize(s) === 'About the Role :') ?? false;
  }

  private toJobPost(path: string, page: SyncerePage, companyUrl: string): JobPostDto | null {
    const p = page.p ?? [];
    const aboutIdx = p.findIndex((s) => this.normalize(s) === 'About the Role :');
    if (aboutIdx < 0) return null;

    const title = this.extractTitle(p, aboutIdx) || this.titleFromPath(path);
    if (!title) return null;

    const jobUrl = `${SYNCERE_ORIGIN}${path}`;
    const id = `syncere-${this.slugFromPath(path)}`;
    const { description, applyEmail } = this.buildDescription(p, aboutIdx);
    const detailsText = this.extractDetailsText(p, aboutIdx);
    const { jobTypes, employmentType } = this.parseJobTypes(detailsText);
    const { isRemote, workFromHomeType } = this.parseWorkplace(detailsText);

    return new JobPostDto({
      id,
      site: Site.SYNCERE,
      title,
      companyName: SYNCERE_COMPANY_NAME,
      companyUrl,
      jobUrl,
      applyUrl: applyEmail ? `mailto:${applyEmail}` : jobUrl,
      location: this.buildLocation(),
      description,
      isRemote,
      workFromHomeType,
      jobType: jobTypes,
      employmentType,
      emails: applyEmail ? [applyEmail] : undefined,
    });
  }

  private extractTitle(p: string[], aboutIdx: number): string | null {
    for (let i = aboutIdx - 1; i >= 0; i--) {
      const text = this.normalize(p[i]);
      if (text && text !== 'STORY' && text !== 'ORDER') {
        return text;
      }
    }
    return null;
  }

  private titleFromPath(path: string): string {
    const slug = path.replace(/^\/+/, '').replace(/-/g, ' ');
    return slug.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private slugFromPath(path: string): string {
    return path.replace(/^\/+/, '').replace(/\/$/, '');
  }

  private buildDescription(
    p: string[],
    aboutIdx: number,
  ): { description: string; applyEmail: string | null } {
    const positions = new Map<string, number>();
    for (const header of SECTION_HEADERS) {
      const idx = p.findIndex(
        (s, i) => i >= aboutIdx && this.normalize(s) === this.normalize(header),
      );
      if (idx >= 0) positions.set(header, idx);
    }

    const sorted = [...positions.entries()].sort((a, b) => a[1] - b[1]);
    const lines: string[] = [];
    let applyEmail: string | null = null;

    for (let i = 0; i < sorted.length; i++) {
      const [header, start] = sorted[i];
      const end = i + 1 < sorted.length ? sorted[i + 1][1] : p.length;
      const contents = p.slice(start + 1, end).filter((s) => !this.isFooter(s));
      if (contents.length === 0) continue;

      lines.push(`## ${header.replace(/\s*:$/, '')}`, '');
      for (const text of contents) {
        const formatted = this.formatBodyText(text);
        if (formatted) lines.push(formatted, '');
      }

      if (this.normalize(header) === 'How to Apply :') {
        const raw = contents.join(' ');
        // Framer concatenates labels such as "Subject:" directly onto the email;
        // insert a space between lowercase/digit and uppercase to recover the token.
        const split = raw.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
        const match = split.match(
          /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/,
        );
        if (match) applyEmail = match[1];
      }
    }

    return { description: lines.join('\n').trim(), applyEmail };
  }

  private extractDetailsText(p: string[], aboutIdx: number): string | null {
    const detailsIdx = p.findIndex(
      (s, i) => i >= aboutIdx && this.normalize(s) === 'Details :',
    );
    if (detailsIdx < 0) return null;

    const nextHeaderIdx = this.nextSectionIndex(p, detailsIdx);
    const contents = p.slice(detailsIdx + 1, nextHeaderIdx ?? p.length).filter(
      (s) => !this.isFooter(s),
    );
    return contents.map((s) => this.normalize(s)).join(' ') || null;
  }

  private nextSectionIndex(p: string[], after: number): number | undefined {
    const positions: number[] = [];
    for (const header of SECTION_HEADERS) {
      const idx = p.findIndex(
        (s, i) => i > after && this.normalize(s) === this.normalize(header),
      );
      if (idx >= 0) positions.push(idx);
    }
    return positions.length ? Math.min(...positions) : undefined;
  }

  private parseJobTypes(
    detailsText: string | null,
  ): { jobTypes: JobType[]; employmentType: string | null } {
    const text = this.normalize(detailsText).toLowerCase();
    if (!text) return { jobTypes: [], employmentType: null };

    const patterns: { regex: RegExp; type: JobType; label: string }[] = [
      { regex: /\bfull[- ]?time\b/, type: JobType.FULL_TIME, label: 'Full time' },
      { regex: /\bpart[- ]?time\b/, type: JobType.PART_TIME, label: 'Part time' },
      { regex: /\bcontract(?:or)?\b/, type: JobType.CONTRACT, label: 'Contract' },
      { regex: /\bintern(?:ship)?\b/, type: JobType.INTERNSHIP, label: 'Internship' },
      { regex: /\btemporary\b/, type: JobType.TEMPORARY, label: 'Temporary' },
      { regex: /\bnights?\b/, type: JobType.NIGHTS, label: 'Nights' },
    ];

    const jobTypes: JobType[] = [];
    const labels: string[] = [];
    for (const { regex, type, label } of patterns) {
      if (regex.test(text) && !jobTypes.includes(type)) {
        jobTypes.push(type);
        labels.push(label);
      }
    }

    const employmentType = labels.length ? labels.join(', ') : null;
    return { jobTypes, employmentType };
  }

  private parseWorkplace(
    detailsText: string | null,
  ): { isRemote: boolean; workFromHomeType: string } {
    const text = this.normalize(detailsText).toLowerCase();
    if (/\bhybrid\b/.test(text)) {
      return { isRemote: false, workFromHomeType: 'Hybrid' };
    }
    if (/\bremote\b/.test(text)) {
      if (!/\b(?:on[- ]?site|in[- ]?person|in[- ]?office)\b/.test(text)) {
        return { isRemote: true, workFromHomeType: 'Remote' };
      }
      return { isRemote: false, workFromHomeType: 'Hybrid' };
    }
    if (/\b(?:on[- ]?site|in[- ]?person|in[- ]?office)\b/.test(text)) {
      return { isRemote: false, workFromHomeType: 'On Site' };
    }
    return { isRemote: false, workFromHomeType: 'On Site' };
  }

  private buildLocation(): LocationDto {
    return new LocationDto({
      city: 'Palo Alto',
      state: 'CA',
      country: Country.USA,
    });
  }

  private formatBodyText(text: string): string {
    const normalized = this.normalize(text);
    if (!normalized) return '';
    if (normalized.includes('•')) {
      const items = normalized
        .split('•')
        .map((s) => s.trim())
        .filter(Boolean);
      return items.map((item) => `- ${item}`).join('\n');
    }
    return normalized;
  }

  private isFooter(text: string): boolean {
    const t = this.normalize(text).toLowerCase();
    return [
      'story',
      'order',
      'contact',
      'follow us',
      'careers',
      'investors',
      'terms of service',
      'privacy',
      'instagram',
      'linkedin',
      'x',
      'designed in palo alto, california',
      '© 2026 syncere',
      'hello@syncereai.com',
    ].some((marker) => t === marker || t.startsWith(marker));
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
    const requested = this.nonNegativeInt(input.resultsWanted, SYNCERE_DEFAULT_RESULTS);
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
    const status = (error as { response?: { status?: unknown } }).response?.status;
    if (typeof status === 'number') {
      return `HTTP ${status}`;
    }
    const name = (error as { name?: unknown }).name;
    return typeof name === 'string' && name ? name : 'request error';
  }
}
