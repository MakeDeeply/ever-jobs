import { SourcePlugin } from '@ever-jobs/plugin';

import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  Site,
  DescriptionFormat,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  markdownConverter,
  extractEmails,
  toDateOnly,
} from '@ever-jobs/common';
import { ADP_API_URL, ADP_HEADERS } from './adp.constants';
import { AdpResponse, AdpJob } from './adp.types';

@SourcePlugin({
  site: Site.ADP,
  name: 'ADP',
  category: 'ats',
  isAts: true,
})
@Injectable()
export class AdpService implements IScraper {
  private readonly logger = new Logger(AdpService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for ADP scraper');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(ADP_HEADERS);

    const url = `${ADP_API_URL}?cid=${encodeURIComponent(companySlug)}`;

    try {
      this.logger.log(`Fetching ADP jobs for company: ${companySlug}`);
      const response = await client.get(url);
      const data: AdpResponse = response.data ?? { jobRequisitions: [] };
      const jobs = data.jobRequisitions ?? [];

      this.logger.log(`ADP: found ${jobs.length} raw jobs for ${companySlug}`);

      const resultsWanted = input.resultsWanted ?? 100;
      const jobPosts: JobPostDto[] = [];

      for (const job of jobs) {
        if (jobPosts.length >= resultsWanted) break;

        try {
          const post = this.mapJob(job, companySlug, input.descriptionFormat);
          if (post) {
            jobPosts.push(post);
          }
        } catch (err: any) {
          this.logger.warn(
            `Error processing ADP job ${job.jobRequisitionId}: ${err.message}`,
          );
        }
      }

      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(
        `ADP scrape error for ${companySlug}: ${err.message}`,
      );
      return new JobResponseDto([]);
    }
  }

  private mapJob(
    job: AdpJob,
    companySlug: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.jobTitle;
    if (!title) return null;

    // Description
    let description: string | null = null;
    const rawDesc = job.jobDescription ?? job.shortDescription ?? null;
    if (rawDesc) {
      if (format === DescriptionFormat.HTML) {
        description = rawDesc;
      } else if (format === DescriptionFormat.MARKDOWN) {
        description = markdownConverter(rawDesc) ?? rawDesc;
      } else {
        description = htmlToPlainText(rawDesc);
      }
    }

    // Location — prefer first location from array, fall back to single
    const loc = job.locations?.[0] ?? job.location ?? null;
    const location = loc
      ? new LocationDto({
          city: loc.city ?? null,
          state: loc.stateProvince ?? null,
          country: loc.country ?? null,
        })
      : null;

    // Remote detection
    const locationStr =
      loc?.formattedAddress ?? loc?.city ?? '';
    const isRemote = locationStr.toLowerCase().includes('remote');

    // Job URL
    const jobUrl =
      job.externalUrl ??
      `https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=${encodeURIComponent(companySlug)}&jobId=${job.jobRequisitionId ?? ''}`;

    return new JobPostDto({
      id: `adp-${job.jobRequisitionId ?? job.requisitionNumber ?? ''}`,
      title,
      companyName: job.companyName ?? companySlug,
      jobUrl,
      location,
      description,
      datePosted: job.postedDate
        ? toDateOnly(job.postedDate)
        : null,
      isRemote,
      emails: extractEmails(description),
      site: Site.ADP,
      atsId: job.jobRequisitionId ?? job.requisitionNumber ?? null,
      atsType: 'adp',
      department: job.departmentName ?? null,
      employmentType: job.employmentType ?? job.workerTypeCode ?? null,
    });
  }
}
