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
  DEFTAI_CO_CAREERS_URL,
  DEFTAI_CO_COMPANY_NAME,
  DEFTAI_CO_DEFAULT_RESULTS,
  DEFTAI_CO_DEFAULT_TIMEOUT_SECONDS,
  DEFTAI_CO_ORIGIN,
} from './deftai_co.constants';

@SourcePlugin({
  site: Site.DEFTAI_CO,
  name: 'Deft Robotics',
  category: 'company',
  companyDomains: ['deftai.co'],
})
@Injectable()
export class DeftaiCoService implements IScraper {
  private readonly logger = new Logger(DeftaiCoService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    try {
      const jobs = await this.fetchJobs(input);
      const out = this.applyInput(jobs, input);
      this.logger.log(`DeftaiCo: scraped ${out.length} jobs`);
      return new JobResponseDto(out);
    } catch (error: unknown) {
      const diagnostics = classifyScrapeError(error);
      this.logger.error(
        `DeftaiCo scrape failed [${diagnostics.reason}]: ${diagnostics.detail ?? this.errorLabel(error)}`,
      );
      return new JobResponseDto([], diagnostics);
    }
  }

  private async fetchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      requestTimeout: input.requestTimeout ?? DEFTAI_CO_DEFAULT_TIMEOUT_SECONDS,
    });

    const fetchUrl = input.companyUrl || DEFTAI_CO_CAREERS_URL;
    const companyUrl = input.companyUrl || DEFTAI_CO_ORIGIN;
    const res = await client.get<string>(fetchUrl);
    const $ = cheerio.load(res.data);
    return this.parsePage($, companyUrl);
  }

  private parsePage($: cheerio.CheerioAPI, companyUrl: string): JobPostDto[] {
    const jobs: JobPostDto[] = [];
    const seen = new Map<string, JobPostDto>();

    $('div[data-framer-name="Variant 1"]').each((_: number, el: any) => {
      const job = this.parseCard($, $(el), companyUrl);
      if (!job) return;
      const key = this.normalize(job.title).toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, job);
        jobs.push(job);
      }
    });

    return jobs;
  }

  private parseCard(
    $: cheerio.CheerioAPI,
    $card: cheerio.Cheerio<any>,
    companyUrl: string,
  ): JobPostDto | null {
    const $link = $card.find('a[href*="tally.so"]').first();
    const applyUrl = this.normalizeApplyUrl($link.attr('href') ?? '');
    if (!applyUrl) return null;

    const texts = this.extractLeafTexts($card).filter((t) => !this.isNoise(t));
    const title = this.normalize(texts[0] ?? '');
    const locationText = this.normalize(texts[1] ?? '');
    if (!title) return null;

    const id = `deftai_co-${this.slugFromTitle(title)}`;

    return new JobPostDto({
      id,
      site: Site.DEFTAI_CO,
      title,
      companyName: DEFTAI_CO_COMPANY_NAME,
      companyUrl: companyUrl || DEFTAI_CO_ORIGIN,
      jobUrl: applyUrl,
      jobUrlDirect: applyUrl,
      applyUrl,
      location: this.parseLocation(locationText),
      isRemote: false,
      workFromHomeType: 'On Site',
      jobType: [JobType.FULL_TIME],
      employmentType: 'FULL_TIME',
    });
  }

  private normalizeApplyUrl(href: string): string | null {
    const match = href.match(/tally\.so\/(?:r|embed)\/([A-Za-z0-9]+)/i);
    if (!match) return null;
    return `https://tally.so/r/${match[1]}`;
  }

  private extractLeafTexts($el: cheerio.Cheerio<any>): string[] {
    const out: string[] = [];
    const collect = (node: any) => {
      if (node.type === 'text') {
        const text = this.normalize(node.data);
        if (text) out.push(text);
      } else if (node.type === 'tag' && node.name !== 'script' && node.name !== 'style') {
        for (const child of node.children ?? []) collect(child);
      }
    };

    for (const node of $el[0]?.children ?? []) collect(node);
    return out;
  }

  private isNoise(text: string): boolean {
    const normalized = text.toLowerCase();
    return normalized === '' || normalized === 'apply now' || normalized === '$' || normalized === '/$';
  }

  private parseLocation(raw: string): LocationDto | null {
    const text = this.normalize(raw);
    if (!text) return null;

    if (text.toLowerCase() === 'sf') {
      return new LocationDto({ city: 'San Francisco', state: 'CA', country: Country.USA });
    }

    const match = text.match(/^([^,]+?)\s*,\s*([A-Za-z]{2})\b/);
    if (match) {
      return new LocationDto({
        city: this.normalize(match[1]),
        state: match[2].toUpperCase(),
        country: Country.USA,
      });
    }

    return new LocationDto({ city: text, country: Country.USA });
  }

  private applyInput(jobs: JobPostDto[], input: ScraperInputDto): JobPostDto[] {
    let filtered = jobs;

    const searchTerm = this.normalize(input.searchTerm).toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter((job) =>
        this.normalize(job.title).toLowerCase().includes(searchTerm),
      );
    }

    const locationTerm = this.normalize(input.location).toLowerCase();
    if (locationTerm) {
      filtered = filtered.filter((job) =>
        this.normalize(job.location?.displayLocation()).toLowerCase().includes(locationTerm),
      );
    }

    if (input.isRemote === true) {
      filtered = filtered.filter((job) => job.isRemote === true);
    }

    if (input.jobType) {
      filtered = filtered.filter((job) => job.jobType?.includes(input.jobType as JobType));
    }

    const offset = this.nonNegativeInt(input.offset, 0);
    const requested = this.nonNegativeInt(input.resultsWanted, DEFTAI_CO_DEFAULT_RESULTS);
    return filtered.slice(offset, offset + requested);
  }

  private slugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private normalize(value: unknown): string {
    if (typeof value !== 'string') return '';
    let out = value
      .split(String.fromCharCode(160))
      .join(' ')
      .replace(/[\u2060\u200b-\u200f\ufeff]/g, '');
    out = this.collapseWhitespace(out);
    return out.trim();
  }

  private collapseWhitespace(value: string): string {
    const result: string[] = [];
    let spacePending = false;
    for (const ch of value) {
      if (this.isWhitespace(ch)) {
        spacePending = true;
      } else {
        if (spacePending) {
          result.push(' ');
          spacePending = false;
        }
        result.push(ch);
      }
    }
    return result.join('');
  }

  private isWhitespace(ch: string): boolean {
    return (
      ch === ' ' ||
      ch === String.fromCharCode(9) ||
      ch === String.fromCharCode(10) ||
      ch === String.fromCharCode(13) ||
      ch === String.fromCharCode(11) ||
      ch === String.fromCharCode(12)
    );
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
