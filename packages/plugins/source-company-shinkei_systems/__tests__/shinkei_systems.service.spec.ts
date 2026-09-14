import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import {
  IScraper,
  JobPostDto,
  JobResponseDto,
  ScraperInputDto,
  Site,
} from '@ever-jobs/models';
import { PluginRegistry } from '@ever-jobs/plugin';

import { ShinkeiSystemsModule, ShinkeiSystemsService } from '../src';

const COMPANY_NAME_EXPECT = 'Shinkei';

function makeFakeKulaAi(jobs: JobPostDto[]): IScraper {
  return {
    scrape: async (input: ScraperInputDto) =>
      new JobResponseDto(
        jobs.map((j) => new JobPostDto({ ...j })),
        input.companySlug === 'shinkei'
          ? undefined
          : { reason: 'bad_input', detail: 'Expected shinkei slug' },
      ),
  } as IScraper;
}

function registryWithKulaAi(jobs: JobPostDto[]): PluginRegistry {
  const registry = new PluginRegistry();
  registry.register(
    { site: Site.KULA_AI, name: 'Kula AI', category: 'ats', isAts: true },
    makeFakeKulaAi(jobs),
  );
  return registry;
}

describe('ShinkeiSystemsService — Kula AI delegation', () => {
  describe('registration scaffolding', () => {
    it('resolves through ShinkeiSystemsModule via NestJS DI', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [ShinkeiSystemsModule],
      }).compile();
      const service = moduleRef.get(ShinkeiSystemsService);
      expect(service).toBeInstanceOf(ShinkeiSystemsService);
      await moduleRef.close();
    });

    it('exports the Site.SHINKEI_SYSTEMS = "shinkei_systems" enum value', () => {
      expect(Site.SHINKEI_SYSTEMS).toBe('shinkei_systems');
    });
  });

  describe('happy path (delegates to the registered Kula AI plugin)', () => {
    it('re-stamps company identity and rewrites id prefix', async () => {
      const jobs = [
        new JobPostDto({
          id: 'kula_ai-123',
          title: 'Mechanical Engineer',
          jobUrl: 'https://careers.kula.ai/shinkei/123/',
          site: Site.KULA_AI,
          companyName: 'Kula AI',
          atsType: 'kula_ai',
        }),
        new JobPostDto({
          id: 'kula_ai-456',
          title: 'Marketing Intern',
          jobUrl: 'https://careers.kula.ai/shinkei/456/',
          site: Site.KULA_AI,
          companyName: 'Kula AI',
          atsType: 'kula_ai',
        }),
      ];

      const service = new ShinkeiSystemsService(registryWithKulaAi(jobs));
      const result = await service.scrape({
        siteType: [Site.SHINKEI_SYSTEMS],
      } as ScraperInputDto);

      expect(result.jobs).toHaveLength(2);

      const mechanical = result.jobs.find((j) => j.id === 'shinkei_systems-123');
      const marketing = result.jobs.find((j) => j.id === 'shinkei_systems-456');

      expect(mechanical).toBeDefined();
      expect(mechanical?.site).toBe(Site.SHINKEI_SYSTEMS);
      expect(mechanical?.companyName).toBe(COMPANY_NAME_EXPECT);
      expect(mechanical?.atsType).toBe('kula_ai');
      expect(mechanical?.id?.startsWith('kula_ai-')).toBe(false);

      expect(marketing).toBeDefined();
      expect(marketing?.site).toBe(Site.SHINKEI_SYSTEMS);
      expect(marketing?.companyName).toBe(COMPANY_NAME_EXPECT);
      expect(marketing?.id).toBe('shinkei_systems-456');
    });

    it('every job carries the company site, companyName, and id prefix', async () => {
      const jobs = [
        new JobPostDto({
          id: 'kula_ai-1',
          title: 'T',
          jobUrl: 'u',
          site: Site.KULA_AI,
          atsType: 'kula_ai',
        }),
      ];

      const service = new ShinkeiSystemsService(registryWithKulaAi(jobs));
      const result = await service.scrape({
        siteType: [Site.SHINKEI_SYSTEMS],
      } as ScraperInputDto);

      for (const job of result.jobs) {
        expect(job.site).toBe(Site.SHINKEI_SYSTEMS);
        expect(job.companyName).toBe(COMPANY_NAME_EXPECT);
        expect(job.id?.startsWith('shinkei_systems-')).toBe(true);
      }
    });
  });

  describe('input pass-through', () => {
    it('forwards the company slug and caller input to the Kula AI scraper', async () => {
      const captured: ScraperInputDto[] = [];
      const fakeKulaAi: IScraper = {
        scrape: async (input) => {
          captured.push(input);
          return new JobResponseDto([
            new JobPostDto({
              id: 'kula_ai-999',
              title: 'Role',
              jobUrl: 'u',
              atsType: 'kula_ai',
            }),
          ]);
        },
      };

      const registry = new PluginRegistry();
      registry.register(
        { site: Site.KULA_AI, name: 'Kula AI', category: 'ats', isAts: true },
        fakeKulaAi,
      );

      const service = new ShinkeiSystemsService(registry);
      const result = await service.scrape({
        siteType: [Site.SHINKEI_SYSTEMS],
        resultsWanted: 7,
      } as ScraperInputDto);

      expect(captured).toHaveLength(1);
      expect(captured[0].companySlug).toBe('shinkei');
      expect(captured[0].resultsWanted).toBe(7);
      expect(result.jobs[0].id).toBe('shinkei_systems-999');
      expect(result.jobs[0].site).toBe(Site.SHINKEI_SYSTEMS);
      expect(result.jobs[0].companyName).toBe(COMPANY_NAME_EXPECT);
    });

    it('only rewrites a leading kula_ai- id prefix', async () => {
      const fakeKulaAi: IScraper = {
        scrape: async () =>
          new JobResponseDto([
            new JobPostDto({
              id: 'kula_ai-kula_ai-7',
              title: 'T',
              jobUrl: 'u',
              atsType: 'kula_ai',
            }),
          ]),
      };

      const registry = new PluginRegistry();
      registry.register(
        { site: Site.KULA_AI, name: 'Kula AI', category: 'ats', isAts: true },
        fakeKulaAi,
      );

      const service = new ShinkeiSystemsService(registry);
      const result = await service.scrape({
        siteType: [Site.SHINKEI_SYSTEMS],
      } as ScraperInputDto);

      expect(result.jobs[0].id).toBe('shinkei_systems-kula_ai-7');
    });
  });

  describe('resilience', () => {
    it('returns an empty response when no Kula AI plugin is registered', async () => {
      const service = new ShinkeiSystemsService(new PluginRegistry());
      const result = await service.scrape({
        siteType: [Site.SHINKEI_SYSTEMS],
      } as ScraperInputDto);
      expect(result.jobs).toHaveLength(0);
    });

    it('returns an empty response when no registry is injected', async () => {
      const service = new ShinkeiSystemsService();
      const result = await service.scrape({
        siteType: [Site.SHINKEI_SYSTEMS],
      } as ScraperInputDto);
      expect(result.jobs).toHaveLength(0);
      expect(result.diagnostics?.reason).toBe('not_registered');
      expect(result.diagnostics?.detail).toContain('Kula AI');
    });
  });
});
