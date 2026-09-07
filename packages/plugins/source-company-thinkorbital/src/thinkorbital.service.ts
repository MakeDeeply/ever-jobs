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
import { createHttpClient, markdownConverter } from '@ever-jobs/common';
import {
  THINKORBITAL_CAREERS_URL,
  THINKORBITAL_COMPANY_NAME,
  THINKORBITAL_DEFAULT_RESULTS,
  THINKORBITAL_DEFAULT_TIMEOUT_SECONDS,
} from './thinkorbital.constants';

interface ParsedSection {
  label: string;
  key: string;
  html: string;
}

interface ParsedBody {
  sections: ParsedSection[];
  values: Map<string, string>;
}

@SourcePlugin({
  site: Site.THINKORBITAL,
  name: 'ThinkOrbital',
  category: 'company',
  companyDomains: ['thinkorbital.com'],
})
@Injectable()
export class ThinkorbitalService implements IScraper {
  private readonly logger = new Logger(ThinkorbitalService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    try {
      const jobs = await this.fetchJobs(input);
      const out = this.applyInput(jobs, input);
      this.logger.log(`ThinkOrbital: scraped ${out.length} jobs`);
      return new JobResponseDto(out);
    } catch (error: unknown) {
      const diagnostics = classifyScrapeError(error);
      this.logger.error(
        `ThinkOrbital scrape failed [${diagnostics.reason}]: ${diagnostics.detail ?? this.errorLabel(error)}`,
      );
      return new JobResponseDto([], diagnostics);
    }
  }

  private async fetchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      requestTimeout: input.requestTimeout ?? THINKORBITAL_DEFAULT_TIMEOUT_SECONDS,
    });

    const companyUrl = input.companyUrl || THINKORBITAL_CAREERS_URL;
    const res = await client.get<string>(companyUrl);
    const $ = cheerio.load(res.data);
    return this.parsePage($, companyUrl);
  }

  private parsePage($: cheerio.CheerioAPI, companyUrl: string): JobPostDto[] {
    const accordion = this.findVisibleAccordion($);
    if (!accordion.length) {
      throw new Error('ThinkOrbital careers page is missing the visible accordion widget');
    }

    const jobs: JobPostDto[] = [];
    accordion.find('.elementor-accordion-item').each((_: number, item: any) => {
      const job = this.parseAccordionItem($, $(item), companyUrl);
      if (job) jobs.push(job);
    });

    return jobs;
  }

  private findVisibleAccordion($: cheerio.CheerioAPI): cheerio.Cheerio<any> {
    return $('div.elementor-widget-accordion')
      .filter((_: number, el: any) => !this.isHidden($(el)))
      .first();
  }

  private isHidden($el: cheerio.Cheerio<any>): boolean {
    const classes = ($el.closest('.elementor-element').attr('class') ?? '').split(/\s+/);
    const hiddenTokens = ['elementor-hidden-desktop', 'elementor-hidden-tablet', 'elementor-hidden-mobile'];
    return hiddenTokens.every((token) => classes.includes(token));
  }

  private parseAccordionItem(
    $: cheerio.CheerioAPI,
    $item: cheerio.Cheerio<any>,
    companyUrl: string,
  ): JobPostDto | null {
    const title = this.normalize($item.find('.elementor-accordion-title').first().text());
    if (!title) return null;

    const $body = $item.find('.elementor-tab-content').first();
    if (!$body.length) return null;

    const body = this.parseBody($, $body);
    const titleFromBody = body.values.get('job title');
    const resolvedTitle = this.normalize(titleFromBody ?? title);
    if (!resolvedTitle) return null;

    const locationText = body.values.get('location') ?? '';
    const employmentType = this.normalize(body.values.get('employment type') ?? '');
    const jobType = this.resolveJobType(employmentType);
    const isRemote = this.detectRemote(employmentType, locationText);
    const workFromHomeType = this.resolveWorkFromHomeType(employmentType, isRemote);
    const description = this.buildDescription(body);

    const id = `thinkorbital-${this.slugFromTitle(resolvedTitle)}`;

    return new JobPostDto({
      id,
      site: Site.THINKORBITAL,
      title: resolvedTitle,
      companyName: THINKORBITAL_COMPANY_NAME,
      companyUrl,
      jobUrl: companyUrl,
      jobUrlDirect: companyUrl,
      location: this.parseLocation(locationText),
      description,
      isRemote,
      workFromHomeType,
      jobType: jobType ? [jobType] : null,
      employmentType,
    });
  }

  private parseBody($: cheerio.CheerioAPI, $body: cheerio.Cheerio<any>): ParsedBody {
    const sections: ParsedSection[] = [];
    const values = new Map<string, string>();
    let current: ParsedSection | null = null;

    $body.contents().each((_: number, node: any) => {
      if (node.type === 'text') return;
      const $node = $(node as any);
      const text = this.normalize($node.text());
      if (!text) return;

      const labelKey = this.matchLabel(text);
      if (labelKey) {
        current = {
          label: text.replace(/[:：\s]+$/g, '').trim(),
          key: labelKey,
          html: '',
        };
        sections.push(current);
        return;
      }

      if (!current) return;

      const html = $node.html() ?? '';
      current.html += (current.html ? '\n' : '') + html;
    });

    for (const section of sections) {
      values.set(section.key, section.html);
    }

    return { sections, values };
  }

  private matchLabel(text: string): string | null {
    const cleaned = this.normalize(text).replace(/[:：\s]+$/g, '').toLowerCase();
    const labels = this.knownLabels();
    if (labels.includes(cleaned)) return cleaned;
    return null;
  }

  private knownLabels(): string[] {
    return [
      'job title',
      'location',
      'employment type',
      'salary range',
      'about thinkorbital',
      'position summary',
      'key responsibilities',
      'mandatory qualifications',
      'desired qualifications',
      'what we offer',
      'job description',
    ];
  }

  private buildDescription(body: ParsedBody): string | null {
    const lines: string[] = [];

    for (const section of body.sections) {
      if (section.key === 'job title') continue;
      const markdown = markdownConverter(section.html);
      if (markdown) {
        lines.push(`## ${section.label}`, '', markdown, '');
      }
    }

    const description = lines.join('\n').trim();
    return description || null;
  }

  private parseLocation(raw: string): LocationDto | null {
    const text = this.normalize(raw);
    if (!text) return null;

    const twoLetterMatch = text.match(/^([^,]+?)\s*,\s*([A-Za-z]{2})\b/);
    if (twoLetterMatch) {
      return new LocationDto({
        city: this.normalize(twoLetterMatch[1]),
        state: twoLetterMatch[2].toUpperCase(),
        country: Country.USA,
      });
    }

    const parts = text.split(',').map((part) => this.normalize(part)).filter(Boolean);
    if (parts.length >= 2) {
      const city = parts[0];
      const rest = parts.slice(1).join(', ');
      const state = this.resolveStateName(rest);
      if (state) {
        return new LocationDto({ city, state, country: Country.USA });
      }
      return new LocationDto({ city, country: Country.USA });
    }

    return new LocationDto({ city: text, country: Country.USA });
  }

  private resolveStateName(raw: string): string | null {
    const segments = raw.split(/[,;]|\s+(?:or|and|&)\s+/).map((s) => this.normalize(s).toLowerCase());
    for (const segment of segments) {
      const abbrev = US_STATE_ABBREVIATIONS.get(segment);
      if (abbrev) return abbrev;
    }
    return null;
  }

  private resolveJobType(employmentType: string): JobType | null {
    const first = employmentType.split(/[;\/]/)[0].trim();
    return getJobTypeFromString(first);
  }

  private detectRemote(employmentType: string, locationText: string): boolean {
    const combined = `${employmentType} ${locationText}`.toLowerCase();
    return combined.includes('remote');
  }

  private resolveWorkFromHomeType(employmentType: string, isRemote: boolean): string {
    if (isRemote) return 'Remote';
    const normalized = employmentType.toLowerCase();
    if (normalized.includes('hybrid')) return 'Hybrid';
    return 'On Site';
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
    const requested = this.nonNegativeInt(input.resultsWanted, THINKORBITAL_DEFAULT_RESULTS);
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
    let out = value.split(String.fromCharCode(160)).join(' ');
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

const US_STATE_ABBREVIATIONS: Map<string, string> = new Map([
  ['alabama', 'AL'],
  ['alaska', 'AK'],
  ['arizona', 'AZ'],
  ['arkansas', 'AR'],
  ['california', 'CA'],
  ['colorado', 'CO'],
  ['connecticut', 'CT'],
  ['delaware', 'DE'],
  ['florida', 'FL'],
  ['georgia', 'GA'],
  ['hawaii', 'HI'],
  ['idaho', 'ID'],
  ['illinois', 'IL'],
  ['indiana', 'IN'],
  ['iowa', 'IA'],
  ['kansas', 'KS'],
  ['kentucky', 'KY'],
  ['louisiana', 'LA'],
  ['maine', 'ME'],
  ['maryland', 'MD'],
  ['massachusetts', 'MA'],
  ['michigan', 'MI'],
  ['minnesota', 'MN'],
  ['mississippi', 'MS'],
  ['missouri', 'MO'],
  ['montana', 'MT'],
  ['nebraska', 'NE'],
  ['nevada', 'NV'],
  ['new hampshire', 'NH'],
  ['new jersey', 'NJ'],
  ['new mexico', 'NM'],
  ['new york', 'NY'],
  ['north carolina', 'NC'],
  ['north dakota', 'ND'],
  ['ohio', 'OH'],
  ['oklahoma', 'OK'],
  ['oregon', 'OR'],
  ['pennsylvania', 'PA'],
  ['rhode island', 'RI'],
  ['south carolina', 'SC'],
  ['south dakota', 'SD'],
  ['tennessee', 'TN'],
  ['texas', 'TX'],
  ['utah', 'UT'],
  ['vermont', 'VT'],
  ['virginia', 'VA'],
  ['washington', 'WA'],
  ['west virginia', 'WV'],
  ['wisconsin', 'WI'],
  ['wyoming', 'WY'],
]);
