import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { SourcePlugin } from '@ever-jobs/plugin';
import {
  classifyScrapeError,
  getJobTypeFromString,
  IScraper,
  JobPostDto,
  JobResponseDto,
  LocationDto,
  ScraperInputDto,
  ScrapeDiagnostics,
  Site,
} from '@ever-jobs/models';
import { createHttpClient, parseLocationText } from '@ever-jobs/common';
import {
  TAU_ROBOTICS_APPLY_JS_URL,
  TAU_ROBOTICS_CAREERS_URL,
  TAU_ROBOTICS_COMPANY_NAME,
  TAU_ROBOTICS_DEFAULT_TIMEOUT_SECONDS,
  TAU_ROBOTICS_ORIGIN,
  TAU_ROBOTICS_SKIP_SLUGS,
} from './tau-robotics.constants';
import { TauRoleDef } from './tau-robotics.types';

interface CareersAnchor {
  slug: string;
  title: string;
  meta: string;
  jobUrl: string;
}

@SourcePlugin({
  site: Site.TAU_ROBOTICS,
  name: 'Tau Robotics',
  category: 'company',
  companyDomains: ['tau-robotics.com'],
})
@Injectable()
export class TauRoboticsService implements IScraper {
  private readonly logger = new Logger(TauRoboticsService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    try {
      const jobs = await this.fetchJobs(input);
      const out = this.applyInput(jobs, input);
      if (jobs.length === 0) {
        return new JobResponseDto(
          [],
          new ScrapeDiagnostics('empty', 'no role anchors found on the Tau Robotics careers page'),
        );
      }
      this.logger.log(`Tau Robotics: scraped ${out.length} jobs`);
      return new JobResponseDto(out);
    } catch (error: unknown) {
      const diagnostics = classifyScrapeError(error);
      this.logger.error(`Tau Robotics scrape failed [${diagnostics.reason}]: ${diagnostics.detail}`);
      return new JobResponseDto([], diagnostics);
    }
  }

  private async fetchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      requestTimeout: input.requestTimeout ?? TAU_ROBOTICS_DEFAULT_TIMEOUT_SECONDS,
    });

    const careersUrl = input.companyUrl || TAU_ROBOTICS_CAREERS_URL;
    const careersRes = await client.get<string>(careersUrl);
    const anchors = this.parseCareersPage(cheerio.load(careersRes.data));
    if (anchors.length === 0) return [];

    const roles = await this.fetchRolesMap(client);
    return anchors.map((anchor) => this.toJobPost(anchor, roles.get(anchor.slug)));
  }

  private parseCareersPage($: cheerio.CheerioAPI): CareersAnchor[] {
    const anchors: CareersAnchor[] = [];
    $('a[href*="apply.html?role="], a[href*="apply?role="]').each((_: number, el: any) => {
      const $a = $(el);
      const href = $a.attr('href') ?? '';
      const slug = this.slugFromHref(href);
      if (!slug || TAU_ROBOTICS_SKIP_SLUGS.has(slug)) return;
      anchors.push({
        slug,
        title: this.normalize($a.find('.role__title').first().text()),
        meta: this.normalize($a.find('.role__meta').first().text()),
        jobUrl: new URL(href, TAU_ROBOTICS_ORIGIN).toString(),
      });
    });
    return anchors;
  }

  private slugFromHref(href: string): string {
    const match = /[?&]role=([a-z0-9-]+)/i.exec(href);
    return match ? match[1] : '';
  }

  private async fetchRolesMap(client: {
    get<T>(url: string): Promise<{ data: T }>;
  }): Promise<Map<string, TauRoleDef>> {
    try {
      const res = await client.get<string>(TAU_ROBOTICS_APPLY_JS_URL);
      return this.parseRolesLiteral(res.data);
    } catch (error: unknown) {
      this.logger.warn(
        `apply.js unavailable — descriptions will be absent: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return new Map();
    }
  }

  /**
   * Extract the `const ROLES = { ... };` object literal from apply.js by
   * balanced-brace slicing, then parse each `'slug': { ... }` entry.
   * Never evals — the literal is single-quoted JS, not JSON.
   */
  private parseRolesLiteral(js: string): Map<string, TauRoleDef> {
    const map = new Map<string, TauRoleDef>();
    const decl = /\bROLES\s*=\s*\{/.exec(js);
    if (!decl) return map;
    const braceStart = js.indexOf('{', decl.index);

    const body = this.sliceBalanced(js, braceStart!);
    if (!body) return map;

    const entryRe = /'([a-z0-9-]+)'\s*:\s*\{/g;
    let m: RegExpExecArray | null;
    while ((m = entryRe.exec(body)) !== null) {
      const entry = this.sliceBalanced(body, m.index + m[0].length - 1);
      if (entry) map.set(m[1], this.parseRoleDef(entry));
    }
    return map;
  }

  /** Slice from the `{` at `openIdx` through its matching `}`. */
  private sliceBalanced(text: string, openIdx: number): string {
    let depth = 0;
    let inString = false;
    for (let i = openIdx; i < text.length; i++) {
      const c = text[i];
      if (inString) {
        if (c === '\\') i++; // skip escaped char
        else if (c === "'") inString = false;
        continue;
      }
      if (c === "'") inString = true;
      else if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) return text.slice(openIdx, i + 1);
      }
    }
    return '';
  }

  private parseRoleDef(literal: string): TauRoleDef {
    return {
      title: this.literalString(literal, 'title'),
      meta: this.literalString(literal, 'meta'),
      responsibilities: this.literalArray(literal, 'responsibilities'),
      requirements: this.literalArray(literal, 'requirements'),
    };
  }

  private literalString(literal: string, key: string): string | undefined {
    const m = new RegExp(`${key}\\s*:\\s*'((?:\\\\.|[^'\\\\])*)'`).exec(literal);
    return m ? this.unescape(m[1]) : undefined;
  }

  private literalArray(literal: string, key: string): string[] | undefined {
    const m = new RegExp(`${key}\\s*:\\s*\\[((?:[^\\[\\]]|'(?:\\\\.|[^'\\\\])*')*)\\]`).exec(literal);
    if (!m) return undefined;
    const items: string[] = [];
    const itemRe = /'((?:\\.|[^'\\])*)'/g;
    let im: RegExpExecArray | null;
    while ((im = itemRe.exec(m[1])) !== null) items.push(this.unescape(im[1]));
    return items;
  }

  private unescape(value: string): string {
    return value.replace(/\\(.)/g, '$1');
  }

  private toJobPost(anchor: CareersAnchor, role?: TauRoleDef): JobPostDto {
    const metaParts = anchor.meta.split('·').map((part) => this.normalize(part));
    const [department, locationText, typeText] = metaParts;
    const parsed = locationText ? parseLocationText(locationText) : null;
    const location = parsed?.location ?? null;
    const jobType = typeText ? getJobTypeFromString(typeText) : null;
    const description = role ? this.buildDescription(role) : undefined;

    return new JobPostDto({
      id: `tau-robotics-${anchor.slug}`,
      atsId: anchor.slug,
      site: Site.TAU_ROBOTICS,
      atsType: 'tau-robotics',
      title: role?.title ?? anchor.title,
      companyName: TAU_ROBOTICS_COMPANY_NAME,
      companyUrl: TAU_ROBOTICS_ORIGIN,
      jobUrl: anchor.jobUrl,
      jobUrlDirect: anchor.jobUrl,
      location,
      ...(location ? { locations: [location] } : {}),
      ...(department ? { department } : {}),
      jobType: jobType ? [jobType] : null,
      ...(typeText ? { employmentType: typeText } : {}),
      ...(description ? { description } : {}),
    });
  }

  private buildDescription(role: TauRoleDef): string {
    const sections: string[] = [];
    if (role.responsibilities?.length) {
      sections.push(`Responsibilities:\n${role.responsibilities.map((r) => `- ${r}`).join('\n')}`);
    }
    if (role.requirements?.length) {
      sections.push(`Requirements:\n${role.requirements.map((r) => `- ${r}`).join('\n')}`);
    }
    return sections.join('\n\n');
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

    const offset = this.nonNegativeInt(input.offset, 0);
    const requested = this.nonNegativeInt(input.resultsWanted, 100);
    return filtered.slice(offset, offset + requested);
  }

  private nonNegativeInt(value: unknown, fallback: number): number {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
  }

  private normalize(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value.split(String.fromCharCode(160)).join(' ').replace(/\s+/g, ' ').trim();
  }
}
