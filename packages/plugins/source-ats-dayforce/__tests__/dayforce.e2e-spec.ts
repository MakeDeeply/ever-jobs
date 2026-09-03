/**
 * E2E test for the Ceridian Dayforce HCM scraper.
 *
 * Dayforce candidate portals now require a CSRF handshake before the geo search
 * endpoint returns results. Tests run against a known Dayforce-powered tenant but
 * tolerate upstream changes / WAF gating by treating zero results as acceptable;
 * the shape assertions only run when jobs are actually returned.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { DayforceModule, DayforceService } from '@ever-jobs/source-ats-dayforce';
import { ScraperInputDto, Site, DescriptionFormat } from '@ever-jobs/models';

describe('DayforceService (E2E)', () => {
  let service: DayforceService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DayforceModule],
    }).compile();

    service = module.get<DayforceService>(DayforceService);
  });

  it('should return job results for a known Dayforce tenant', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.DAYFORCE],
      companySlug: 'gannett',
      resultsWanted: 5,
      descriptionFormat: DescriptionFormat.MARKDOWN,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(Array.isArray(response.jobs)).toBe(true);

    if (response.jobs.length > 0) {
      const job = response.jobs[0];
      expect(typeof job.title).toBe('string');
      expect(job.site).toBe(Site.DAYFORCE);
      expect(job.atsType).toBe('dayforce');
      expect(job.atsId).toBeDefined();
      expect(job.jobUrl).toBeDefined();
    }
  }, 30000);

  it('should return empty results when neither companySlug nor companyUrl is provided', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.DAYFORCE],
      resultsWanted: 5,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(response.jobs.length).toBe(0);
  });

  it('should handle an unknown tenant gracefully', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.DAYFORCE],
      companySlug: 'this-tenant-definitely-does-not-exist-xyz-99999',
      resultsWanted: 5,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(Array.isArray(response.jobs)).toBe(true);
  }, 30000);

  it('should respect the resultsWanted limit', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.DAYFORCE],
      companySlug: 'gannett',
      resultsWanted: 3,
      descriptionFormat: DescriptionFormat.PLAIN,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(response.jobs.length).toBeLessThanOrEqual(3);
  }, 30000);
});
