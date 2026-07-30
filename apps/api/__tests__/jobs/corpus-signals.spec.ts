import { JobsController } from '../../src/jobs/jobs.controller';
import { LegitimacyDetectorService } from '@ever-jobs/legitimacy-detector';
import type { JobPostDto, ScraperInputDto } from '@ever-jobs/models';

/**
 * Spec 740 — controller enrichment: liveness + legitimacy are opt-in (query flags) and absent on
 * the default path. Uses the real (pure) legitimacy detector and a stub liveness checker.
 */

function makeRawJobs(): JobPostDto[] {
  return [
    {
      title: 'Senior Backend Engineer',
      jobUrl: 'https://example.com/jobs/1',
      compensation: null,
      description: 'short',
      companyLogo: null,
      atsType: null,
    } as unknown as JobPostDto,
  ];
}

function makeController(): JobsController {
  const jobsService = { searchJobs: async () => makeRawJobs() } as never;
  const aggregator = {
    aggregateRaw: async (jobs: JobPostDto[]) => ({
      jobs,
      rawCount: jobs.length,
      deduped: 0,
      dedupMetrics: {},
    }),
  } as never;
  const analytics = {} as never;
  const cache = { get: async () => null, set: async () => undefined } as never;
  const liveness = {
    check: async () => ({ url: 'x', result: 'active', code: 'apply_control_visible', checkedAt: '2026-06-15T00:00:00Z' }),
    checkBatch: async (urls: string[]) =>
      urls.map((url) => ({ url, result: 'active' as const, code: 'apply_control_visible' as const, checkedAt: '2026-06-15T00:00:00Z' })),
  } as never;
  const legitimacy = new LegitimacyDetectorService();
  // Spec 5024 — ConfigService seam; returning the caller's default keeps the
  // historical `persist: true` behaviour these cases were written against.
  const config = { get: (_key: string, def?: unknown) => def } as never;
  return new JobsController(
    jobsService,
    aggregator,
    analytics,
    cache,
    config,
    liveness,
    legitimacy,
  );
}

const INPUT = { searchTerm: 'engineer' } as ScraperInputDto;

describe('JobsController — corpus signals (Spec 740)', () => {
  it('does NOT attach liveness/legitimacy on the default path', async () => {
    const result = (await makeController().searchJobs(INPUT)) as { jobs: JobPostDto[] };
    expect(result.jobs[0]!.liveness == null).toBe(true);
    expect(result.jobs[0]!.legitimacy == null).toBe(true);
  });

  it('attaches legitimacy when ?legitimacy=true', async () => {
    // positional: input, format, paginate, page, pageSize, dedup, liveness, legitimacy
    const result = (await makeController().searchJobs(
      INPUT,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'true',
    )) as { jobs: JobPostDto[] };
    expect(result.jobs[0]!.legitimacy).toBeDefined();
    expect(['verified', 'likely', 'uncertain']).toContain(result.jobs[0]!.legitimacy!.state);
    expect(result.jobs[0]!.liveness == null).toBe(true);
  });

  it('attaches liveness when ?liveness=true', async () => {
    const result = (await makeController().searchJobs(
      INPUT,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'true',
    )) as { jobs: JobPostDto[] };
    expect(result.jobs[0]!.liveness).toBeDefined();
    expect(result.jobs[0]!.liveness!.state).toBe('active');
  });
});
