import { SourcePlugin, PluginRegistry } from '@ever-jobs/plugin';

import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  IScraper, ScraperInputDto, JobResponseDto, Site,
} from '@ever-jobs/models';

/**
 * Reka — Builds multimodal foundation models.
 *
 * Reka is an AI research company that develops multimodal foundation models
 * capable of processing text, images, audio, and video, offered to
 * enterprises and developers.
 *
 * Sector: AI foundation-model lab. HQ: San Francisco, California, USA.
 *
 * Source: Ashby job board, company slug `reka`
 * (`https://jobs.ashbyhq.com/reka`). The company's live
 * postings are served by Ashby. Rather than re-implement Ashby parsing (and
 * risk drift), this plugin resolves the registered Ashby source plugin from
 * the `PluginRegistry` at runtime and delegates the fetch + field mapping to
 * it, then re-stamps the company identity (site, companyName, id prefix) onto
 * the results — so every Ashby field fix is inherited automatically. This
 * honours the "no plugin imports a peer plugin directly; discover via the
 * registry" rule.
 */
const COMPANY_SLUG = 'reka';
const COMPANY_NAME = 'Reka';

@SourcePlugin({
  site: Site.REKA,
  name: COMPANY_NAME,
  category: 'company',
})
@Injectable()
export class RekaService implements IScraper {
  private readonly logger = new Logger(RekaService.name);

  constructor(
    @Optional() private readonly registry?: PluginRegistry,
  ) {}

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const ashby = this.registry?.getScraper(Site.ASHBY);
    if (!ashby) {
      this.logger.error(
        'Ashby source plugin is not registered; cannot scrape Reka',
      );
      return new JobResponseDto([]);
    }

    this.logger.log(
      `Reka: delegating to Ashby (slug ${COMPANY_SLUG})`,
    );

    const result = await ashby.scrape({
      ...input,
      companySlug: COMPANY_SLUG,
    } as ScraperInputDto);

    for (const job of result.jobs) {
      job.site = Site.REKA;
      job.companyName = COMPANY_NAME;
      if (job.id) {
        job.id = job.id.replace(/^ashby-/, 'reka-');
      }
    }

    this.logger.log(`Reka: scraped ${result.jobs.length} jobs`);
    return result;
  }
}
