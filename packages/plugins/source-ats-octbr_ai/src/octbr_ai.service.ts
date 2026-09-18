import { Injectable, Logger } from '@nestjs/common';
import { SourcePlugin } from '@ever-jobs/plugin';
import {
  classifyScrapeError,
  getJobTypeFromString,
  IScraper,
  JobPostDto,
  JobResponseDto,
  ScraperInputDto,
  Site,
} from '@ever-jobs/models';
import {
  createHttpClient,
  decodeHtmlEntities,
  parseLocationText,
  stripHtmlTags,
} from '@ever-jobs/common';
import {
  OCTBR_AI_DATA_PAGE_RE,
  OCTBR_AI_DEFAULT_TIMEOUT_SECONDS,
  OCTBR_AI_HOST,
} from './octbr_ai.constants';
import {
  OctbrAiDepartmentGroup,
  OctbrAiDetailJob,
  OctbrAiListJob,
} from './octbr_ai.types';

@SourcePlugin({
  site: Site.OCTBR_AI,
  name: 'Octbr',
  category: 'ats',
  isAts: true,
})
@Injectable()
export class OctbrAiService implements IScraper {
  private readonly logger = new Logger(OctbrAiService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const company = input.companySlug;
    if (!company) {
      this.logger.warn('No companySlug provided for Octbr scraper');
      return new JobResponseDto([]);
    }

    const jobs: JobPostDto[] = [];
    const resultsWanted = input.resultsWanted ?? 100;

    try {
      const client = createHttpClient({
        proxies: input.proxies,
        requestTimeout: input.requestTimeout ?? OCTBR_AI_DEFAULT_TIMEOUT_SECONDS,
      });

      const listingHtml = await this.fetchText(client, this.origin(company));
      const page = this.parseDataPage(listingHtml);
      const groups = (page?.props?.jobsByDepartment ??
        []) as OctbrAiDepartmentGroup[];
      const companyName: string | null = page?.props?.organisation?.name ?? null;

      const listed: { job: OctbrAiListJob; department: string }[] = [];
      for (const group of groups) {
        for (const job of group.jobs ?? []) {
          if (listed.length >= resultsWanted) break;
          if (!job?.title) continue;
          listed.push({ job, department: group.department ?? '' });
        }
      }

      const settled = await Promise.allSettled(
        listed.map(({ job }) => this.fetchText(client, job.url)),
      );

      listed.forEach(({ job, department }, i) => {
        const detailRes = settled[i];
        const detail =
          detailRes.status === 'fulfilled'
            ? (this.parseDataPage(detailRes.value)?.props
                ?.job as OctbrAiDetailJob | undefined)
            : undefined;
        jobs.push(this.toJobPost(job, department, company, companyName, detail));
      });

      this.logger.log(`Octbr: scraped ${jobs.length} jobs for ${company}`);
    } catch (err: unknown) {
      this.logger.error(
        `Octbr scrape failed for ${company}: ${(err as Error)?.message ?? err}`,
      );
      return new JobResponseDto(jobs, classifyScrapeError(err));
    }

    return new JobResponseDto(jobs);
  }

  /** GET a URL as text. Isolated so tests can substitute fixtures per URL. */
  protected async fetchText(
    client: ReturnType<typeof createHttpClient>,
    url: string,
  ): Promise<string> {
    const res = await client.get<string>(url, { responseType: 'text' });
    return typeof res.data === 'string' ? res.data : '';
  }

  private origin(company: string): string {
    return `https://${company}.${OCTBR_AI_HOST}/`;
  }

  /**
   * Extract the Inertia `data-page` prop: an HTML-entity-encoded JSON blob on
   * the root div. Returns null when absent or malformed.
   */
  private parseDataPage(html: string): any {
    const match = OCTBR_AI_DATA_PAGE_RE.exec(html);
    if (!match) return null;
    try {
      return JSON.parse(decodeHtmlEntities(match[1]));
    } catch {
      return null;
    }
  }

  private toJobPost(
    job: OctbrAiListJob,
    department: string,
    company: string,
    companyName: string | null,
    detail: OctbrAiDetailJob | undefined,
  ): JobPostDto {
    const locationText = (job.location ?? '').trim();
    const { location } = locationText
      ? parseLocationText(locationText)
      : { location: null };

    const jobType = getJobTypeFromString(
      job.employment_type_label ?? job.employment_type ?? '',
    );

    return new JobPostDto({
      id: `octbr_ai-${company}-${job.id ?? job.slug}`,
      site: Site.OCTBR_AI,
      title: job.title,
      companyName: companyName ?? company,
      companyUrl: this.origin(company),
      jobUrl: job.url,
      applyUrl: job.url,
      location,
      ...(location ? { locations: [location] } : {}),
      description: this.description(detail),
      datePosted: this.datePosted(detail?.posted_date),
      isRemote:
        job.location_type === 'remote' ||
        locationText.toLowerCase().includes('remote'),
      ...(jobType ? { jobType: [jobType] } : {}),
      department: detail?.department ?? (department || null),
      atsId: String(job.id ?? job.slug),
      atsType: 'octbr_ai',
    });
  }

  /** Compose JD text from the detail page's HTML sections. */
  private description(detail: OctbrAiDetailJob | undefined): string | null {
    if (!detail) return null;
    const parts: string[] = [];
    const push = (label: string | null, html: string | null | undefined) => {
      const text = (stripHtmlTags(html ?? '') ?? '').trim();
      if (!text) return;
      parts.push(label ? `${label}\n${text}` : text);
    };
    push(null, detail.description);
    push('**Responsibilities**', detail.responsibilities);
    push('**Qualifications**', detail.requirements);
    return parts.join('\n\n').trim() || null;
  }

  private datePosted(value: string | null | undefined): Date | null {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
