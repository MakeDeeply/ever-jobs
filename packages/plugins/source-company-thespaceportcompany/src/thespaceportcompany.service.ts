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
import { createHttpClient, markdownConverter } from '@ever-jobs/common';
import {
  THESPACEPORTCOMPANY_CAREERS_URL,
  THESPACEPORTCOMPANY_COMPANY_NAME,
  THESPACEPORTCOMPANY_DEFAULT_RESULTS,
  THESPACEPORTCOMPANY_DEFAULT_TIMEOUT_SECONDS,
} from './thespaceportcompany.constants';

@SourcePlugin({
  site: Site.THE_SPACEPORT_COMPANY,
  name: 'The Spaceport Company',
  category: 'company',
  companyDomains: ['thespaceportcompany.com', 'www.thespaceportcompany.com'],
})
@Injectable()
export class TheSpaceportcompanyService implements IScraper {
  private readonly logger = new Logger(TheSpaceportcompanyService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    try {
      const jobs = await this.fetchJobs(input);
      const out = this.applyInput(jobs, input);
      this.logger.log(`The Spaceport Company: scraped ${out.length} jobs`);
      return new JobResponseDto(out);
    } catch (error: unknown) {
      const diagnostics = classifyScrapeError(error);
      this.logger.error(
        `The Spaceport Company scrape failed [${diagnostics.reason}]: ${diagnostics.detail ?? this.errorLabel(error)}`,
      );
      return new JobResponseDto([], diagnostics);
    }
  }

  private async fetchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      requestTimeout: input.requestTimeout ?? THESPACEPORTCOMPANY_DEFAULT_TIMEOUT_SECONDS,
    });

    const companyUrl = input.companyUrl || THESPACEPORTCOMPANY_CAREERS_URL;
    const res = await client.get<string>(companyUrl);
    const $ = cheerio.load(res.data);
    return this.parsePage($, companyUrl);
  }

  private parsePage($: cheerio.CheerioAPI, companyUrl: string): JobPostDto[] {
    const jobs: JobPostDto[] = [];

    const openPositions = $('section.elementor-top-section')
      .filter((_: number, el: any) => {
        const text = this.normalize($(el).text());
        return text.includes('Open Positions');
      })
      .first();

    if (!openPositions.length) {
      throw new Error('The Spaceport Company careers page is missing the Open Positions section');
    }

    const sections = openPositions.nextAll('section.elementor-top-section');

    sections.each((_: number, el: any) => {
      const $section = $(el);
      if (this.isHidden($section)) return;

      const job = this.parseJobSection($, $section, companyUrl);
      if (job) jobs.push(job);
    });

    return jobs;
  }

  private isHidden($section: cheerio.Cheerio<any>): boolean {
    const classes = ($section.attr('class') ?? '').split(/\s+/);
    const hiddenTokens = ['elementor-hidden-desktop', 'elementor-hidden-tablet', 'elementor-hidden-mobile'];
    return hiddenTokens.every((token) => classes.includes(token));
  }

  private parseJobSection(
    $: cheerio.CheerioAPI,
    $section: cheerio.Cheerio<any>,
    companyUrl: string,
  ): JobPostDto | null {
    const accordion = $section.find('div.elementor-widget-accordion').first();
    if (!accordion.length) return null;

    const applyLink = $section.find('a[href^="mailto:"]').first().attr('href')?.trim();
    if (!applyLink) return null;

    const $editors = $section.find('div.elementor-widget-text-editor');
    if ($editors.length === 0) return null;

    const title = this.normalize($editors.eq(0).find('p').first().text());
    if (!title) return null;

    const metadata = this.extractMetadata($editors, $);
    const overviewHtml = this.extractOverviewHtml($editors, $);

    const description = this.buildDescription(overviewHtml, accordion, $);
    const location = this.parseLocation(metadata);

    const id = `thespaceportcompany-${this.slugFromTitle(title)}`;

    return new JobPostDto({
      id,
      site: Site.THE_SPACEPORT_COMPANY,
      title,
      companyName: THESPACEPORTCOMPANY_COMPANY_NAME,
      companyUrl,
      jobUrl: companyUrl,
      jobUrlDirect: companyUrl,
      applyUrl: applyLink,
      location,
      description,
      isRemote: false,
      workFromHomeType: 'On Site',
      jobType: [JobType.FULL_TIME],
      employmentType: 'Full time',
    });
  }

  private extractMetadata($editors: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
    for (let i = 0; i < $editors.length; i++) {
      const $editor = $editors.eq(i);
      const firstLi = $editor.find('ul li').first().text();
      if (firstLi) {
        return this.normalize(firstLi);
      }
    }
    return '';
  }

  private extractOverviewHtml($editors: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
    for (let i = 1; i < $editors.length; i++) {
      const $editor = $editors.eq(i);
      if ($editor.find('p').length > 0 && $editor.find('ul').length === 0) {
        return $editor.find('.elementor-widget-container').html() ?? $editor.html() ?? '';
      }
    }
    return '';
  }

  private buildDescription(
    overviewHtml: string,
    accordion: cheerio.Cheerio<any>,
    $: cheerio.CheerioAPI,
  ): string | null {
    const lines: string[] = [];

    if (overviewHtml) {
      const overviewMarkdown = markdownConverter(overviewHtml);
      if (overviewMarkdown) {
        lines.push(overviewMarkdown, '');
      }
    }

    accordion.find('.elementor-accordion-item').each((_: number, item: any) => {
      const $item = $(item);
      const heading = this.normalize($item.find('.elementor-accordion-title').first().text()).replace(/[:：]+$/g, '');
      const contentHtml = $item.find('.elementor-tab-content').first().html();
      if (!heading || !contentHtml) return;

      const contentMarkdown = markdownConverter(contentHtml);
      if (!contentMarkdown) return;

      lines.push(`## ${heading}`, '', contentMarkdown, '');
    });

    const description = lines.join('\n').trim();
    return description || null;
  }

  private parseLocation(metadata: string): LocationDto | null {
    if (!metadata) return null;

    const roleMatch = metadata.match(/This role will be in the ([^<\n]+?) location/i);
    const hqMatch = metadata.match(/headquartered in ([^<,\n]+),\s*([A-Za-z]{2})\b/i);

    const city = roleMatch?.[1].trim() ?? hqMatch?.[1].trim() ?? null;
    const state = hqMatch?.[2].trim().toUpperCase() ?? null;

    if (!city && !state) return null;

    return new LocationDto({
      city,
      state,
      country: Country.USA,
    });
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
    const requested = this.nonNegativeInt(input.resultsWanted, THESPACEPORTCOMPANY_DEFAULT_RESULTS);
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
