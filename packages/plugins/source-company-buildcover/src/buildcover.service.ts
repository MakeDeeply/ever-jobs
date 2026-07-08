import { Injectable, Logger } from '@nestjs/common';
import { SourcePlugin } from '@ever-jobs/plugin';
import {
  CompensationDto,
  getJobTypeFromString,
  IScraper,
  JobPostDto,
  JobResponseDto,
  JobType,
  LocationDto,
  ScraperInputDto,
  Site,
} from '@ever-jobs/models';
import {
  createHttpClient,
  extractEmails,
  parseLocationList,
  salaryToCompensation,
  toDateOnly,
} from '@ever-jobs/common';
import {
  BUILDCOVER_COMPANY_NAME,
  BUILDCOVER_CAREERS_URL,
  BUILDCOVER_DEFAULT_RESULTS,
  BUILDCOVER_DEFAULT_TIMEOUT_SECONDS,
  BUILDCOVER_GROQ_QUERY,
  BUILDCOVER_SECTIONS,
  buildcoverJobUrl,
  buildcoverSanityUrl,
} from './buildcover.constants';
import {
  BuildcoverQueryResult,
  SanityBlock,
  SanityCareer,
  SanityExtraSection,
  SanityQueryResponse,
} from './buildcover.types';

@SourcePlugin({
  site: Site.BUILDCOVER,
  name: 'Cover',
  category: 'company',
})
@Injectable()
export class BuildcoverService implements IScraper {
  private readonly logger = new Logger(BuildcoverService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    try {
      const client = createHttpClient({
        proxies: input.proxies,
        caCert: input.caCert,
        requestTimeout:
          input.requestTimeout ?? BUILDCOVER_DEFAULT_TIMEOUT_SECONDS,
      });

      const response = await client.get<SanityQueryResponse>(
        buildcoverSanityUrl(BUILDCOVER_GROQ_QUERY),
      );
      const result: BuildcoverQueryResult = response.data?.result ?? {};
      const careers = Array.isArray(result.careers) ? result.careers : [];
      if (careers.length === 0) {
        this.logger.warn('Cover Sanity query returned no career documents');
        return new JobResponseDto([]);
      }

      const applyEmail = this.normalize(result.contactEmail).toLowerCase() || null;
      const jobs = this.applyInput(
        careers
          .filter((career) => this.slug(career))
          .map((career) => this.toJobPost(career, applyEmail)),
        input,
      );

      this.logger.log(`Cover: scraped ${jobs.length} jobs`);
      return new JobResponseDto(jobs);
    } catch (error: unknown) {
      this.logger.error(`Cover scrape failed (${this.errorLabel(error)})`);
      return new JobResponseDto([]);
    }
  }

  private toJobPost(career: SanityCareer, applyEmail: string | null): JobPostDto {
    const slug = this.slug(career);
    const title = this.normalize(career.title);
    const description = this.buildDescription(career);
    const compensationText = this.salaryText(this.blocksToText(career.compensation));
    const compensation: CompensationDto | null = compensationText
      ? salaryToCompensation(compensationText)
      : null;

    const locationText = this.normalize(career.location);
    const cleanedLocation = this.stripOnSite(locationText);
    const parsed = parseLocationList([cleanedLocation || null]);
    const location: LocationDto | null = cleanedLocation ? parsed.location : null;

    const employmentType = this.normalize(career.type) || null;
    const jobType = employmentType
      ? getJobTypeFromString(employmentType)
      : null;

    const bodyEmails = extractEmails(description) ?? [];
    const emails = applyEmail ? [applyEmail] : bodyEmails;
    const posted = career._createdAt ?? career._updatedAt ?? null;

    return new JobPostDto({
      id: `buildcover-${slug}`,
      site: Site.BUILDCOVER,
      title,
      companyName: BUILDCOVER_COMPANY_NAME,
      companyUrl: BUILDCOVER_CAREERS_URL,
      jobUrl: buildcoverJobUrl(slug),
      location,
      description: description || null,
      isRemote: cleanedLocation ? parsed.remoteMentioned : null,
      ...(parsed.workFromHomeType
        ? { workFromHomeType: parsed.workFromHomeType }
        : {}),
      ...(employmentType ? { employmentType } : {}),
      ...(jobType ? { jobType: [jobType] } : {}),
      ...(compensation ? { compensation } : {}),
      datePosted: posted ? toDateOnly(posted) : null,
      emails,
      applyUrl: emails[0] ? `mailto:${emails[0]}` : null,
    });
  }

  /**
   * Assemble the description from the role's Portable-Text sections in Cover's
   * own on-page order and labels: Overview, Role, Experience, any extraSections
   * (under their own titles), then Compensation. Absent sections are skipped.
   */
  private buildDescription(career: SanityCareer): string {
    const parts: string[] = [];

    for (const section of BUILDCOVER_SECTIONS) {
      const rendered = this.renderBlocks(career[section.key]);
      if (rendered) parts.push(`## ${section.label}\n${rendered}`);
      if (section.key === 'experience') {
        for (const extra of this.extraSections(career.extraSections)) {
          const extraBody = this.renderBlocks(extra.content);
          if (!extraBody) continue;
          const label = this.normalize(extra.title);
          parts.push(label ? `## ${label}\n${extraBody}` : extraBody);
        }
      }
    }

    return this.collapse(parts.join('\n\n'));
  }

  /** Render a Portable-Text block array to markdown-ish text. */
  private renderBlocks(blocks: SanityBlock[] | null | undefined): string {
    if (!Array.isArray(blocks)) return '';
    const lines: string[] = [];
    for (const block of blocks) {
      const text = this.blockText(block);
      if (!text) continue;
      lines.push(this.renderBlock(block, text));
    }
    return this.collapse(lines.join('\n'));
  }

  private renderBlock(block: SanityBlock, text: string): string {
    if (block.listItem === 'bullet') return `- ${text}`;
    if (block.listItem === 'number') return `1. ${text}`;
    switch (block.style) {
      case 'h1':
        return `# ${text}`;
      case 'h2':
        return `## ${text}`;
      case 'h3':
        return `### ${text}`;
      case 'h4':
        return `#### ${text}`;
      case 'blockquote':
        return `> ${text}`;
      default:
        return text;
    }
  }

  /** Flatten a block array's span text (no markup), for salary parsing. */
  private blocksToText(blocks: SanityBlock[] | null | undefined): string {
    if (!Array.isArray(blocks)) return '';
    return this.collapse(
      blocks
        .map((block) => this.blockText(block))
        .filter((text) => text)
        .join('\n'),
    );
  }

  private blockText(block: SanityBlock | undefined): string {
    if (!block || !Array.isArray(block.children)) return '';
    return block.children
      .map((span) => (typeof span?.text === 'string' ? span.text : ''))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extraSections(
    sections: SanityExtraSection[] | null | undefined,
  ): SanityExtraSection[] {
    return Array.isArray(sections) ? sections : [];
  }

  private applyInput(
    jobs: JobPostDto[],
    input: ScraperInputDto,
  ): JobPostDto[] {
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
      BUILDCOVER_DEFAULT_RESULTS,
    );
    return filtered.slice(offset, offset + requested);
  }

  private slug(career: SanityCareer): string {
    const slug = this.normalize(career.slug);
    if (slug) return slug;
    // Fall back to a title slug so a role missing its slug still resolves.
    return this.normalize(career.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Normalise prose pay text for the shared salary parser: unicode dashes → `-`,
   * and drop the per-unit token that sits between the amount and the separator
   * (`$35/hr - $40/hr`), which the parser cannot see through. The magnitude then
   * drives the interval (35 → hourly), so the values survive intact.
   */
  private salaryText(text: string): string {
    return text
      .replace(/[\u2012-\u2015\u2212]/g, '-')
      .replace(/\s*\/\s*(?:hr|hour|hrs|yr|year|mo|month|wk|week|day)\b\.?/gi, '')
      .replace(/\s+per\s+(?:hour|year|month|week|day)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /** parseLocationList strips remote/hybrid but not "on-site"; drop that token. */
  private stripOnSite(location: string): string {
    return location
      .replace(/\(\s*on[-\s]?site\s*\)/gi, '')
      .replace(/\bon[-\s]?site\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/[\s,]+$/g, '')
      .trim();
  }

  private collapse(body: string): string {
    return body
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+$/g, ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private normalize(value: unknown): string {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  }

  private nonNegativeInt(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? Math.floor(value)
      : fallback;
  }

  private errorLabel(error: unknown): string {
    if (!error || typeof error !== 'object') return 'unknown error';
    const status = (error as { response?: { status?: unknown } }).response
      ?.status;
    if (typeof status === 'number') return `HTTP ${status}`;
    const name = (error as { name?: unknown }).name;
    return typeof name === 'string' && name ? name : 'request error';
  }
}
