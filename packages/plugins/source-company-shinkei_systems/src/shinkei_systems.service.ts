import { SourcePlugin, PluginRegistry } from '@ever-jobs/plugin';

import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  Site,
  ScrapeDiagnostics,
} from '@ever-jobs/models';

import {
  SHINKEI_SYSTEMS_COMPANY_NAME,
  SHINKEI_SYSTEMS_KULA_AI_SLUG,
} from './shinkei_systems.constants';

/**
 * Shinkei — Kula AI-hosted company careers page.
 *
 * Live postings are served by Kula (`careers.kula.ai/shinkei`). Rather than
 * re-implement Kula parsing, this plugin resolves the registered Kula AI source
 * plugin from the `PluginRegistry` at runtime and delegates the fetch + field
 * mapping to it, then re-stamps the company identity (site, companyName, id
 * prefix) onto the results. This honours the "no plugin imports a peer plugin
 * directly; discover via the registry" rule.
 */
@SourcePlugin({
  site: Site.SHINKEI_SYSTEMS,
  name: SHINKEI_SYSTEMS_COMPANY_NAME,
  category: 'company',
  companyDomains: ['shinkei.systems', 'shinkeisystems.com'],
})
@Injectable()
export class ShinkeiSystemsService implements IScraper {
  private readonly logger = new Logger(ShinkeiSystemsService.name);

  constructor(
    @Optional() private readonly registry?: PluginRegistry,
  ) {}

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const kulaAi = this.registry?.getScraper(Site.KULA_AI);
    if (!kulaAi) {
      this.logger.error(
        'Kula AI source plugin is not registered; cannot scrape Shinkei',
      );
      // A registry miss is a wiring problem, not an empty board -
      // not_registered keeps the two distinguishable upstream.
      return new JobResponseDto(
        [],
        new ScrapeDiagnostics('not_registered', 'Kula AI source plugin is not registered'),
      );
    }

    this.logger.log(
      `Shinkei: delegating to Kula AI (slug ${SHINKEI_SYSTEMS_KULA_AI_SLUG})`,
    );

    const result = await kulaAi.scrape({
      ...input,
      companySlug: SHINKEI_SYSTEMS_KULA_AI_SLUG,
    } as ScraperInputDto);

    for (const job of result.jobs) {
      job.site = Site.SHINKEI_SYSTEMS;
      job.companyName = SHINKEI_SYSTEMS_COMPANY_NAME;
      if (job.id) {
        job.id = job.id.replace(/^kula_ai-/, 'shinkei_systems-');
      }
    }

    this.logger.log(`Shinkei: scraped ${result.jobs.length} jobs`);
    return result;
  }
}
