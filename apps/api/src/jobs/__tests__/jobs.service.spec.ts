import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import {
  ScraperInputDto,
  JobPostDto,
  JobResponseDto,
  Site,
  IScraper,
  Country,
  SalarySource,
  CompensationDto,
  CompensationInterval,
} from '@ever-jobs/models';
import { PluginRegistry } from '@ever-jobs/plugin';

// ---------------------------------------------------------------------------
// Mock ALL source packages before importing JobsService.
// jest.mock() calls are hoisted, but can reference variables prefixed with `mock`.
//
// We auto-mock every source package with a simple class containing a scrape stub.
// This prevents TypeScript compilation of the real source files, avoiding
// cascading TS errors from dice.service.ts etc.
// ---------------------------------------------------------------------------
const mockSourceFactory = () => {
  const handler: ProxyHandler<object> = {
    get: (_target, prop) => {
      if (prop === '__esModule') return true;
      // Return a class with a scrape method for any named export
      return class { scrape = jest.fn(); };
    },
  };
  return new Proxy({}, handler);
};

jest.mock('@ever-jobs/source-linkedin', () => mockSourceFactory());
jest.mock('@ever-jobs/source-indeed', () => mockSourceFactory());
jest.mock('@ever-jobs/source-glassdoor', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ziprecruiter', () => mockSourceFactory());
jest.mock('@ever-jobs/source-google', () => mockSourceFactory());
jest.mock('@ever-jobs/source-bayt', () => mockSourceFactory());
jest.mock('@ever-jobs/source-naukri', () => mockSourceFactory());
jest.mock('@ever-jobs/source-bdjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-internshala', () => mockSourceFactory());
jest.mock('@ever-jobs/source-exa', () => mockSourceFactory());
jest.mock('@ever-jobs/source-upwork', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-ashby', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-greenhouse', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-lever', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-workable', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-smartrecruiters', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-rippling', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-workday', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-amazon', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-apple', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-microsoft', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-nvidia', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-tiktok', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-uber', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-cursor', () => mockSourceFactory());
jest.mock('@ever-jobs/source-remoteok', () => mockSourceFactory());
jest.mock('@ever-jobs/source-remotive', () => mockSourceFactory());
jest.mock('@ever-jobs/source-jobicy', () => mockSourceFactory());
jest.mock('@ever-jobs/source-himalayas', () => mockSourceFactory());
jest.mock('@ever-jobs/source-arbeitnow', () => mockSourceFactory());
jest.mock('@ever-jobs/source-weworkremotely', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-recruitee', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-teamtailor', () => mockSourceFactory());
jest.mock('@ever-jobs/source-usajobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-adzuna', () => mockSourceFactory());
jest.mock('@ever-jobs/source-reed', () => mockSourceFactory());
jest.mock('@ever-jobs/source-jooble', () => mockSourceFactory());
jest.mock('@ever-jobs/source-careerjet', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-bamboohr', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-personio', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-jazzhr', () => mockSourceFactory());
jest.mock('@ever-jobs/source-dice', () => mockSourceFactory());
jest.mock('@ever-jobs/source-simplyhired', () => mockSourceFactory());
jest.mock('@ever-jobs/source-wellfound', () => mockSourceFactory());
jest.mock('@ever-jobs/source-stepstone', () => mockSourceFactory());
jest.mock('@ever-jobs/source-monster', () => mockSourceFactory());
jest.mock('@ever-jobs/source-careerbuilder', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-icims', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-taleo', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-successfactors', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-jobvite', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-adp', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-ukg', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-google', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-meta', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-netflix', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-stripe', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-openai', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-breezyhr', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-comeet', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-pinpoint', () => mockSourceFactory());
jest.mock('@ever-jobs/source-builtin', () => mockSourceFactory());
jest.mock('@ever-jobs/source-snagajob', () => mockSourceFactory());
jest.mock('@ever-jobs/source-dribbble', () => mockSourceFactory());
// Phase 8: ATS Expansion
jest.mock('@ever-jobs/source-ats-manatal', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-paylocity', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-freshteam', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-bullhorn', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-trakstar', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-hiringthing', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-loxo', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-fountain', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-deel', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-phenom', () => mockSourceFactory());
// Phase 8: Company scrapers
jest.mock('@ever-jobs/source-company-ibm', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-boeing', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-zoom', () => mockSourceFactory());
// Phase 9: Job board expansion
jest.mock('@ever-jobs/source-themuse', () => mockSourceFactory());
jest.mock('@ever-jobs/source-workingnomads', () => mockSourceFactory());
jest.mock('@ever-jobs/source-4dayweek', () => mockSourceFactory());
jest.mock('@ever-jobs/source-startupjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-nodesk', () => mockSourceFactory());
jest.mock('@ever-jobs/source-web3career', () => mockSourceFactory());
jest.mock('@ever-jobs/source-echojobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-jobstreet', () => mockSourceFactory());
// Phase 10: Government boards & ATS expansion
jest.mock('@ever-jobs/source-careeronestop', () => mockSourceFactory());
jest.mock('@ever-jobs/source-arbeitsagentur', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-jobylon', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-homerun', () => mockSourceFactory());
// Phase 11: Niche boards & developer API expansion
jest.mock('@ever-jobs/source-hackernews', () => mockSourceFactory());
jest.mock('@ever-jobs/source-landingjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-findwork', () => mockSourceFactory());
jest.mock('@ever-jobs/source-jobdataapi', () => mockSourceFactory());
// Phase 12: ATS & niche board expansion
jest.mock('@ever-jobs/source-authenticjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-jobscore', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-talentlyft', () => mockSourceFactory());
// Phase 13: RSS niche board expansion
jest.mock('@ever-jobs/source-cryptojobslist', () => mockSourceFactory());
jest.mock('@ever-jobs/source-jobspresso', () => mockSourceFactory());
jest.mock('@ever-jobs/source-higheredjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-fossjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-larajobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-pythonjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-drupaljobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-realworkfromanywhere', () => mockSourceFactory());
jest.mock('@ever-jobs/source-golangjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-wordpressjobs', () => mockSourceFactory());
// Phase 14: API-key sources & ATS expansion
jest.mock('@ever-jobs/source-talroo', () => mockSourceFactory());
jest.mock('@ever-jobs/source-infojobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-crelate', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-ismartrecruit', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-recruiterflow', () => mockSourceFactory());
// Phase 15: European government & regional boards
jest.mock('@ever-jobs/source-jobtechdev', () => mockSourceFactory());
jest.mock('@ever-jobs/source-francetravail', () => mockSourceFactory());
jest.mock('@ever-jobs/source-navjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-jobsacuk', () => mockSourceFactory());
jest.mock('@ever-jobs/source-jobindex', () => mockSourceFactory());
// Phase 16: Global expansion (LatAm, gig, startup, Canada)
jest.mock('@ever-jobs/source-getonboard', () => mockSourceFactory());
jest.mock('@ever-jobs/source-freelancercom', () => mockSourceFactory());
jest.mock('@ever-jobs/source-joinrise', () => mockSourceFactory());
jest.mock('@ever-jobs/source-canadajobbank', () => mockSourceFactory());
// Phase 17: Niche & international expansion (NGO, UN, IT)
jest.mock('@ever-jobs/source-reliefweb', () => mockSourceFactory());
jest.mock('@ever-jobs/source-undpjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-devitjobs', () => mockSourceFactory());
// Phase 18: Niche RSS expansion (tech, design, environment, regional)
jest.mock('@ever-jobs/source-pyjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-vuejobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-conservationjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-coroflot', () => mockSourceFactory());
jest.mock('@ever-jobs/source-berlinstartupjobs', () => mockSourceFactory());
// Phase 19: Tech niche, crypto, regional expansion
jest.mock('@ever-jobs/source-railsjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-elixirjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-crunchboard', () => mockSourceFactory());
jest.mock('@ever-jobs/source-cryptocurrencyjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-hasjob', () => mockSourceFactory());
// Phase 20: European regional & niche expansion
jest.mock('@ever-jobs/source-icrunchdata', () => mockSourceFactory());
jest.mock('@ever-jobs/source-swissdevjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-germantechjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-virtualvocations', () => mockSourceFactory());
jest.mock('@ever-jobs/source-nofluffjobs', () => mockSourceFactory());
// Phase 21: Niche & academic expansion
jest.mock('@ever-jobs/source-greenjobsboard', () => mockSourceFactory());
jest.mock('@ever-jobs/source-eurojobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-opensourcedesignjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-academiccareers', () => mockSourceFactory());
jest.mock('@ever-jobs/source-remotefirstjobs', () => mockSourceFactory());
// Phase 22: Eastern European, CIS & Singapore expansion
jest.mock('@ever-jobs/source-djinni', () => mockSourceFactory());
jest.mock('@ever-jobs/source-headhunter', () => mockSourceFactory());
jest.mock('@ever-jobs/source-habrcareer', () => mockSourceFactory());
jest.mock('@ever-jobs/source-mycareersfuture', () => mockSourceFactory());
// Phase 23: Japan, Nordic & Swiss expansion
jest.mock('@ever-jobs/source-jobsinjapan', () => mockSourceFactory());
jest.mock('@ever-jobs/source-duunitori', () => mockSourceFactory());
jest.mock('@ever-jobs/source-jobsch', () => mockSourceFactory());
// Phase 24: UK & mobile dev expansion
jest.mock('@ever-jobs/source-guardianjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-androidjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-iosdevjobs', () => mockSourceFactory());
// Phase 25: DevOps niche expansion
jest.mock('@ever-jobs/source-devopsjobs', () => mockSourceFactory());
// Phase 25: FP, diversity & niche expansion
jest.mock('@ever-jobs/source-functionalworks', () => mockSourceFactory());
jest.mock('@ever-jobs/source-powertofly', () => mockSourceFactory());
jest.mock('@ever-jobs/source-clojurejobs', () => mockSourceFactory());
// Phase 26: Sustainability & niche expansion
jest.mock('@ever-jobs/source-ecojobs', () => mockSourceFactory());

import { JobsService } from '../jobs.service';

const ATS_SITES = new Set<string>([
  Site.GREENHOUSE,
  Site.LEVER,
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a mock scraper that resolves with the given jobs */
function makeScraper(jobs: Partial<JobPostDto>[] = []): IScraper {
  return {
    scrape: jest.fn().mockResolvedValue(
      new JobResponseDto(
        jobs.map(
          (j) =>
            new JobPostDto({
              id: j.id ?? `job-${Math.random().toString(36).slice(2)}`,
              title: j.title ?? 'Software Engineer',
              companyName: j.companyName ?? 'Acme Corp',
              jobUrl: j.jobUrl ?? 'https://example.com/job/1',
              site: j.site,
              description: j.description,
              compensation: j.compensation,
              datePosted: j.datePosted,
              isRemote: j.isRemote ?? false,
            }),
        ),
      ),
    ),
  };
}

/** Create a failing mock scraper */
function failingScraper(error = 'Network timeout'): IScraper {
  return { scrape: jest.fn().mockRejectedValue(new Error(error)) };
}

/**
 * Create a JobsService instance with a custom PluginRegistry.
 * Bypasses the real constructor by using Object.create.
 */
function createService(scraperEntries: [Site, IScraper, boolean?][]): JobsService {
  const service = Object.create(JobsService.prototype);
  service.logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  service.configService = {
    get: jest.fn().mockReturnValue({
      defaultRetries: 0,
      defaultDelayMs: 0,
      defaultBackoff: 'exponential',
      perSource: {},
    }),
  };
  service.metrics = {
    scraperDuration: { startTimer: jest.fn().mockReturnValue(jest.fn()) },
    scraperRequestsTotal: { inc: jest.fn() },
  };

  const registry = new PluginRegistry();
  for (const [site, scraper, isAts] of scraperEntries) {
    registry.register(
      { site, name: site, category: isAts ? 'ats' : 'job-board', isAts: !!isAts },
      scraper,
    );
  }
  service.registry = registry;
  return service;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('JobsService', () => {
  describe('searchJobs — site routing', () => {
    it('should use explicit siteType when provided', async () => {
      const linkedin = makeScraper([{ title: 'LI job' }]);
      const indeed = makeScraper([{ title: 'Indeed job' }]);
      const service = createService([
        [Site.LINKEDIN, linkedin],
        [Site.INDEED, indeed],
      ]);

      const input = new ScraperInputDto({ searchTerm: 'node', siteType: [Site.LINKEDIN] });
      const result = await service.searchJobs(input);

      expect(linkedin.scrape).toHaveBeenCalled();
      expect(indeed.scrape).not.toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('LI job');
    });

    it('should route to ATS scrapers when companySlug is provided and no explicit sites', async () => {
      const greenhouse = makeScraper([{ title: 'GH job' }]);
      const linkedin = makeScraper([{ title: 'LI job' }]);
      const service = createService([
        [Site.GREENHOUSE, greenhouse, true],
        [Site.LINKEDIN, linkedin],
      ]);

      const input = new ScraperInputDto({
        searchTerm: 'node',
        companySlug: 'stripe',
        siteType: undefined,
      });
      const result = await service.searchJobs(input);

      // GREENHOUSE is ATS → called; LINKEDIN is search → skipped
      expect(greenhouse.scrape).toHaveBeenCalled();
      expect(linkedin.scrape).not.toHaveBeenCalled();
      expect(result.length).toBe(1);
    });

    it('should skip ATS scrapers in default routing (no companySlug, no siteType)', async () => {
      const linkedin = makeScraper([{ title: 'LI job' }]);
      const lever = makeScraper([{ title: 'Lever job' }]);
      const amazon = makeScraper([{ title: 'Amazon job' }]);
      const service = createService([
        [Site.LINKEDIN, linkedin],
        [Site.LEVER, lever, true],
        [Site.AMAZON, amazon],
      ]);

      const input = new ScraperInputDto({ searchTerm: 'node', siteType: undefined });
      const result = await service.searchJobs(input);

      expect(linkedin.scrape).toHaveBeenCalled();
      expect(amazon.scrape).toHaveBeenCalled();
      expect(lever.scrape).not.toHaveBeenCalled();
      expect(result.length).toBe(2);
    });

    it('should return empty array when no valid scrapers match', async () => {
      const service = createService([]);
      const input = new ScraperInputDto({ searchTerm: 'node', siteType: [Site.LINKEDIN] });
      const result = await service.searchJobs(input);
      expect(result).toEqual([]);
    });

    it('should allow ATS scrapers via explicit siteType even without companySlug', async () => {
      const lever = makeScraper([{ title: 'Lever job' }]);
      const service = createService([[Site.LEVER, lever, true]]);

      const input = new ScraperInputDto({
        searchTerm: 'node',
        siteType: [Site.LEVER],
      });
      const result = await service.searchJobs(input);

      expect(lever.scrape).toHaveBeenCalled();
      expect(result.length).toBe(1);
    });

    it('should resolve companyDomain to a registered Site token', async () => {
      const buildcover = makeScraper([{ title: 'Buildcover job' }]);
      const linkedin = makeScraper([{ title: 'LI job' }]);
      const service = createService([
        [Site.BUILDCOVER, buildcover],
        [Site.LINKEDIN, linkedin],
      ]);

      const input = new ScraperInputDto({
        searchTerm: 'engineer',
        companyDomain: ['buildcover.com'],
      });
      const result = await service.searchJobs(input);

      expect(buildcover.scrape).toHaveBeenCalled();
      expect(linkedin.scrape).not.toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Buildcover job');
    });

    it('should union companyDomain with explicit siteType', async () => {
      const buildcover = makeScraper([{ title: 'Buildcover job' }]);
      const linkedin = makeScraper([{ title: 'LI job' }]);
      const service = createService([
        [Site.BUILDCOVER, buildcover],
        [Site.LINKEDIN, linkedin],
      ]);

      const input = new ScraperInputDto({
        searchTerm: 'engineer',
        siteType: [Site.LINKEDIN],
        companyDomain: ['buildcover.com'],
      });
      const result = await service.searchJobs(input);

      expect(linkedin.scrape).toHaveBeenCalled();
      expect(buildcover.scrape).toHaveBeenCalled();
      expect(result.length).toBe(2);
    });

    it('should throw BadRequestException for an unresolved companyDomain', async () => {
      const linkedin = makeScraper([{ title: 'LI job' }]);
      const service = createService([[Site.LINKEDIN, linkedin]]);

      const input = new ScraperInputDto({
        searchTerm: 'engineer',
        companyDomain: ['not-a-real-company.io'],
      });

      await expect(service.searchJobs(input)).rejects.toThrow(BadRequestException);
      await expect(service.searchJobs(input)).rejects.toThrow(
        /domain `not-a-real-company\.io` → token `not-a-real-company_io` is not a registered plugin/,
      );
      expect(linkedin.scrape).not.toHaveBeenCalled();
    });

    it('should resolve a full URL or www-prefixed domain', async () => {
      const hyl = makeScraper([{ title: 'Hylio job' }]);
      const service = createService([[Site.HYL_IO, hyl]]);

      const input = new ScraperInputDto({
        searchTerm: 'drone',
        companyDomain: ['https://www.hyl.io/careers'],
      });
      const result = await service.searchJobs(input);

      expect(hyl.scrape).toHaveBeenCalled();
      expect(result.length).toBe(1);
    });

    it('should ignore empty or whitespace-only companyDomain entries', async () => {
      const buildcover = makeScraper([{ title: 'Buildcover job' }]);
      const service = createService([[Site.BUILDCOVER, buildcover]]);

      const input = new ScraperInputDto({
        searchTerm: 'engineer',
        companyDomain: ['', '  ', 'buildcover.com'],
      });
      const result = await service.searchJobs(input);

      expect(buildcover.scrape).toHaveBeenCalled();
      expect(result.length).toBe(1);
    });
  });

  describe('searchJobs — error handling', () => {
    it('should not crash when one scraper fails', async () => {
      const linkedin = makeScraper([{ title: 'LI job' }]);
      const service = createService([
        [Site.LINKEDIN, linkedin],
        [Site.INDEED, failingScraper()],
      ]);

      const input = new ScraperInputDto({
        searchTerm: 'node',
        siteType: [Site.LINKEDIN, Site.INDEED],
      });
      const result = await service.searchJobs(input);

      expect(result.length).toBe(1);
      expect(result[0].title).toBe('LI job');
    });

    it('should return empty array when all scrapers fail', async () => {
      const service = createService([
        [Site.LINKEDIN, failingScraper('API down')],
      ]);

      const input = new ScraperInputDto({ searchTerm: 'node', siteType: [Site.LINKEDIN] });
      const result = await service.searchJobs(input);

      expect(result).toEqual([]);
    });
  });

  describe('searchJobs — result tagging and sorting', () => {
    it('should tag each job with its source site', async () => {
      const linkedin = makeScraper([{ title: 'Job A' }]);
      const indeed = makeScraper([{ title: 'Job B' }]);
      const service = createService([
        [Site.LINKEDIN, linkedin],
        [Site.INDEED, indeed],
      ]);

      const input = new ScraperInputDto({
        searchTerm: 'node',
        siteType: [Site.LINKEDIN, Site.INDEED],
      });
      const result = await service.searchJobs(input);

      const sites = result.map((j) => j.site);
      expect(sites).toContain(Site.LINKEDIN);
      expect(sites).toContain(Site.INDEED);
    });

    it('should sort results by site name then date descending', async () => {
      const scraper = makeScraper([
        { title: 'Old', datePosted: '2024-01-01' },
        { title: 'New', datePosted: '2024-06-01' },
      ]);
      const service = createService([[Site.LINKEDIN, scraper]]);

      const input = new ScraperInputDto({ searchTerm: 'node', siteType: [Site.LINKEDIN] });
      const result = await service.searchJobs(input);

      expect(result[0].title).toBe('New');
      expect(result[1].title).toBe('Old');
    });
  });

  describe('postProcessSalary', () => {
    let service: JobsService;

    beforeEach(() => {
      service = createService([]);
    });

    it('should set salarySource to DIRECT_DATA when compensation exists', () => {
      const job = new JobPostDto({
        id: '1', title: 'SWE', companyName: 'Co', jobUrl: 'https://example.com',
        compensation: new CompensationDto({
          interval: CompensationInterval.YEARLY, minAmount: 100000, maxAmount: 150000, currency: 'USD',
        }),
      });

      (service as any).postProcessSalary(job, new ScraperInputDto({ searchTerm: 'node' }));
      expect(job.salarySource).toBe(SalarySource.DIRECT_DATA);
    });

    it('should convert hourly to annual when enforceAnnualSalary is true', () => {
      const job = new JobPostDto({
        id: '1', title: 'SWE', companyName: 'Co', jobUrl: 'https://example.com',
        compensation: new CompensationDto({
          interval: CompensationInterval.HOURLY, minAmount: 50, maxAmount: 100, currency: 'USD',
        }),
      });

      (service as any).postProcessSalary(
        job, new ScraperInputDto({ searchTerm: 'node', enforceAnnualSalary: true }),
      );

      expect(job.compensation!.minAmount).toBe(104000);
      expect(job.compensation!.maxAmount).toBe(208000);
    });

    it('should extract salary from description for USA jobs without compensation', () => {
      const job = new JobPostDto({
        id: '1', title: 'SWE', companyName: 'Co', jobUrl: 'https://example.com',
        description: 'Salary range: $120,000 - $180,000 per year',
      });

      (service as any).postProcessSalary(
        job, new ScraperInputDto({ searchTerm: 'node', country: Country.USA }),
      );

      expect(job.salarySource).toBe(SalarySource.DESCRIPTION);
      expect(job.compensation).toBeDefined();
      expect(job.compensation!.minAmount).toBe(120000);
      expect(job.compensation!.maxAmount).toBe(180000);
    });

    it('should not extract salary for non-USA countries', () => {
      const job = new JobPostDto({
        id: '1', title: 'SWE', companyName: 'Co', jobUrl: 'https://example.com',
        description: 'Salary range: $120,000 - $180,000 per year',
      });

      (service as any).postProcessSalary(
        job, new ScraperInputDto({ searchTerm: 'node', country: Country.UK }),
      );

      expect(job.compensation).toBeUndefined();
      expect(job.salarySource).toBeUndefined();
    });

    it('should clear salarySource when no salary data exists', () => {
      const job = new JobPostDto({
        id: '1', title: 'SWE', companyName: 'Co', jobUrl: 'https://example.com',
      });

      (service as any).postProcessSalary(
        job, new ScraperInputDto({ searchTerm: 'node' }),
      );

      expect(job.salarySource).toBeUndefined();
    });
  });
});
