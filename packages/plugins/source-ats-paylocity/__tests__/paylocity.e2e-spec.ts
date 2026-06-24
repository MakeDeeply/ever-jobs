/**
 * Network smoke test for the Paylocity scraper (Spec 5020).
 *
 * Hits the live Paylocity board + detail pages, so it is **opt-in**: it only
 * runs when `RUN_NETWORK_E2E=1`, keeping CI/local runs deterministic and
 * offline. The deterministic, fixture-driven coverage lives in
 * `paylocity.service.spec.ts`.
 *
 * The companySlug is the company GUID from the public careers-page board link.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { PaylocityModule, PaylocityService } from '@ever-jobs/source-ats-paylocity';
import { ScraperInputDto, Site, DescriptionFormat } from '@ever-jobs/models';

// Real GUID: SendCutSend Inc (7 live openings as of capture).
const SENDCUTSEND_GUID = '3ecffcba-6b5a-4a7e-b71b-bbb54a4527ab';

const describeNetwork = process.env.RUN_NETWORK_E2E ? describe : describe.skip;

describeNetwork('PaylocityService (network E2E)', () => {
  let service: PaylocityService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PaylocityModule],
    }).compile();

    service = module.get<PaylocityService>(PaylocityService);
  });

  it('scrapes live jobs from the board page', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.PAYLOCITY],
      companySlug: SENDCUTSEND_GUID,
      resultsWanted: 5,
      descriptionFormat: DescriptionFormat.MARKDOWN,
    });

    const response = await service.scrape(input);

    expect(response.jobs.length).toBeGreaterThan(0);
    const job = response.jobs[0];
    expect(typeof job.title).toBe('string');
    expect(job.site).toBe(Site.PAYLOCITY);
    expect(job.atsType).toBe('paylocity');
    expect(job.id).toMatch(/^paylocity-/);
    expect(job.description).toBeTruthy();
  }, 30000);

  it('returns empty results when no companySlug provided', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.PAYLOCITY],
      resultsWanted: 5,
    });

    const response = await service.scrape(input);
    expect(response.jobs.length).toBe(0);
  });
});
