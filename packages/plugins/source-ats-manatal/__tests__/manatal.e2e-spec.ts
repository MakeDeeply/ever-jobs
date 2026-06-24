/**
 * Network smoke test for the Manatal scraper (Spec 5021).
 *
 * Hits the live careers-page.com JSON API, so it is **opt-in**: it only runs
 * when `RUN_NETWORK_E2E=1`, keeping CI/local runs deterministic and offline.
 * The deterministic, fixture-driven coverage lives in `manatal.service.spec.ts`.
 *
 * The companySlug is the careers-page.com client slug (first path segment of
 * `https://www.careers-page.com/{slug}/`).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ManatalModule, ManatalService } from '@ever-jobs/source-ats-manatal';
import { ScraperInputDto, Site, DescriptionFormat } from '@ever-jobs/models';

// Real slug: Castelion Corporation (130+ live openings as of capture).
const CASTELION_SLUG = 'castelion-corporation';

const describeNetwork = process.env.RUN_NETWORK_E2E ? describe : describe.skip;

describeNetwork('ManatalService (network E2E)', () => {
  let service: ManatalService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ManatalModule],
    }).compile();

    service = module.get<ManatalService>(ManatalService);
  });

  it('scrapes live jobs from the careers-page.com API', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.MANATAL],
      companySlug: CASTELION_SLUG,
      resultsWanted: 5,
      descriptionFormat: DescriptionFormat.MARKDOWN,
    });

    const response = await service.scrape(input);

    expect(response.jobs.length).toBeGreaterThan(0);
    const job = response.jobs[0];
    expect(typeof job.title).toBe('string');
    expect(job.site).toBe(Site.MANATAL);
    expect(job.atsType).toBe('manatal');
    expect(job.id).toMatch(/^manatal-/);
    expect(job.description).toBeTruthy();
  }, 30000);

  it('returns empty results when no companySlug provided', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.MANATAL],
      resultsWanted: 5,
    });

    const response = await service.scrape(input);
    expect(response.jobs.length).toBe(0);
  });
});
