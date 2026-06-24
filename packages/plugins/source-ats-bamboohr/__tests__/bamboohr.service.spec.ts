import 'reflect-metadata';
import {
  CompensationInterval,
  DescriptionFormat,
  JobType,
  ScraperInputDto,
  Site,
} from '@ever-jobs/models';

const mockGet = jest.fn();
jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(() => ({
      get: mockGet,
      setHeaders: jest.fn(),
    })),
  };
});

import { BambooHRService } from '../src/bamboohr.service';
import { BambooHRJob, BambooHRJobDetail } from '../src/bamboohr.types';

function listing(overrides: Partial<BambooHRJob> = {}): BambooHRJob {
  return {
    id: '13',
    jobOpeningName: 'Senior Engineer',
    departmentLabel: 'Engineering',
    location: { city: 'Austin', state: 'Texas' },
    atsLocation: { country: 'United States', state: null, city: null },
    employmentStatusLabel: 'Full-Time',
    locationType: 0,
    isRemote: null,
    ...overrides,
  };
}

function detail(overrides: Partial<BambooHRJobDetail> = {}): BambooHRJobDetail {
  return {
    location: { city: 'Austin', state: 'Texas' },
    atsLocation: { country: 'United States', state: null, city: null },
    description: '<p>Build great things.</p>',
    compensation: '$120,000 - $140,000',
    datePosted: '2026-04-02',
    locationType: '0',
    employmentStatusLabel: 'Full-Time',
    jobOpeningShareUrl: 'https://acme.bamboohr.com/careers/13',
    ...overrides,
  };
}

/** Route the mocked GET by URL: list endpoint vs per-job detail endpoint. */
function mockBoard(
  jobs: BambooHRJob[],
  detailById: Record<string, BambooHRJobDetail | Error>,
) {
  mockGet.mockImplementation((url: string) => {
    if (url.endsWith('/careers/list')) {
      return Promise.resolve({ data: { result: jobs } });
    }
    const match = url.match(/\/careers\/([^/]+)\/detail$/);
    if (match) {
      const entry = detailById[decodeURIComponent(match[1])];
      if (entry == null) return Promise.reject(new Error('404'));
      if (entry instanceof Error) return Promise.reject(entry);
      return Promise.resolve({ data: { result: { jobOpening: entry } } });
    }
    return Promise.reject(new Error(`unexpected url ${url}`));
  });
}

function input(overrides: Partial<ScraperInputDto> = {}): ScraperInputDto {
  return {
    companySlug: 'acme',
    siteType: [Site.BAMBOOHR],
    resultsWanted: 100,
    ...overrides,
  } as ScraperInputDto;
}

describe('BambooHRService', () => {
  let service: BambooHRService;

  beforeEach(() => {
    mockGet.mockReset();
    service = new BambooHRService();
  });

  it('overlays the per-job detail for description, compensation, datePosted', async () => {
    mockBoard([listing()], { '13': detail() });

    const res = await service.scrape(
      input({ descriptionFormat: DescriptionFormat.PLAIN }),
    );

    expect(res.jobs).toHaveLength(1);
    const job = res.jobs[0];
    expect(job.title).toBe('Senior Engineer');
    expect(job.description).toBe('Build great things.');
    expect(job.datePosted).toBe('2026-04-02');
    expect(job.compensation?.minAmount).toBe(120000);
    expect(job.compensation?.maxAmount).toBe(140000);
    expect(job.compensation?.interval).toBe(CompensationInterval.YEARLY);
    expect(job.site).toBe(Site.BAMBOOHR);
    expect(job.atsType).toBe('bamboohr');
    expect(job.atsId).toBe('13');
    expect(job.id).toBe('bamboohr-13');
  });

  it('maps locationType=1 to Remote work mode and isRemote=true', async () => {
    mockBoard([listing({ locationType: 1, location: { city: null, state: null } })], {
      '13': detail({
        locationType: '1',
        location: { city: null, state: null },
        atsLocation: { country: 'United States', state: null, city: null },
      }),
    });

    const res = await service.scrape(input());

    expect(res.jobs[0].workFromHomeType).toBe('Remote');
    expect(res.jobs[0].isRemote).toBe(true);
    expect(res.jobs[0].location?.city).toBe('Remote');
    expect(res.jobs[0].location?.country).toBe('United States');
  });

  it('maps locationType=2 to Hybrid and leaves isRemote=false', async () => {
    mockBoard([listing({ locationType: 2 })], {
      '13': detail({ locationType: '2' }),
    });

    const res = await service.scrape(input());

    expect(res.jobs[0].workFromHomeType).toBe('Hybrid');
    expect(res.jobs[0].isRemote).toBe(false);
  });

  it('maps locationType=0 to no work mode and isRemote=false', async () => {
    mockBoard([listing({ locationType: 0 })], {
      '13': detail({ locationType: '0' }),
    });

    const res = await service.scrape(input());

    expect(res.jobs[0].workFromHomeType).toBeFalsy();
    expect(res.jobs[0].isRemote).toBe(false);
  });

  it('maps employmentStatusLabel to jobType and employmentType', async () => {
    mockBoard(
      [listing({ employmentStatusLabel: 'Contract' })],
      { '13': detail({ employmentStatusLabel: 'Contract' }) },
    );

    const res = await service.scrape(input());

    expect(res.jobs[0].jobType).toEqual([JobType.CONTRACT]);
    expect(res.jobs[0].employmentType).toBe('Contract');
  });

  it('builds structured location from list city/state + atsLocation country', async () => {
    mockBoard(
      [
        listing({
          location: { city: 'Lumberton', state: 'North Carolina' },
          atsLocation: { country: 'United States', state: null, city: null },
        }),
      ],
      {
        '13': detail({
          location: { city: null, state: null },
          atsLocation: { country: 'United States', state: null, city: null },
        }),
      },
    );

    const res = await service.scrape(input());

    expect(res.jobs[0].location?.city).toBe('Lumberton');
    expect(res.jobs[0].location?.state).toBe('North Carolina');
    expect(res.jobs[0].location?.country).toBe('United States');
  });

  it('is fail-safe: a failed detail fetch still maps the job from the list', async () => {
    mockBoard(
      [listing({ id: '1' }), listing({ id: '2', jobOpeningName: 'Designer' })],
      {
        '1': new Error('boom'),
        '2': detail({ description: '<p>Design things.</p>' }),
      },
    );

    const res = await service.scrape(
      input({ descriptionFormat: DescriptionFormat.PLAIN }),
    );

    expect(res.jobs).toHaveLength(2);
    const failed = res.jobs.find((j) => j.atsId === '1');
    const ok = res.jobs.find((j) => j.atsId === '2');
    expect(failed?.title).toBe('Senior Engineer');
    expect(failed?.description).toBeNull();
    expect(failed?.compensation).toBeUndefined();
    expect(ok?.description).toBe('Design things.');
  });

  it('omits compensation when the detail carries no parseable salary', async () => {
    mockBoard([listing()], {
      '13': detail({ compensation: 'Competitive' }),
    });

    const res = await service.scrape(input());

    expect(res.jobs[0].compensation).toBeUndefined();
  });

  it('parses an hourly compensation range with the hourly interval', async () => {
    mockBoard([listing()], {
      '13': detail({ compensation: '$19.00 - $27.00 / hr' }),
    });

    const res = await service.scrape(input());

    expect(res.jobs[0].compensation?.minAmount).toBe(19);
    expect(res.jobs[0].compensation?.maxAmount).toBe(27);
    expect(res.jobs[0].compensation?.interval).toBe(CompensationInterval.HOURLY);
  });

  it('renders the description as markdown when requested', async () => {
    mockBoard([listing()], {
      '13': detail({ description: '<p>Hello <strong>world</strong></p>' }),
    });

    const res = await service.scrape(
      input({ descriptionFormat: DescriptionFormat.MARKDOWN }),
    );

    expect(res.jobs[0].description).toContain('**world**');
  });

  it('prefers the detail jobOpeningShareUrl for the job URL', async () => {
    mockBoard([listing()], {
      '13': detail({
        jobOpeningShareUrl: 'https://acme.bamboohr.com/careers/13',
      }),
    });

    const res = await service.scrape(input());

    expect(res.jobs[0].jobUrl).toBe('https://acme.bamboohr.com/careers/13');
  });

  it('falls back to a constructed job URL when the detail has none', async () => {
    mockBoard([listing()], {
      '13': detail({ jobOpeningShareUrl: null }),
    });

    const res = await service.scrape(input());

    expect(res.jobs[0].jobUrl).toBe('https://acme.bamboohr.com/careers/13');
  });

  it('honors resultsWanted and only fetches details for the wanted slice', async () => {
    const jobs = [
      listing({ id: '1' }),
      listing({ id: '2' }),
      listing({ id: '3' }),
    ];
    mockBoard(jobs, {
      '1': detail(),
      '2': detail(),
      '3': detail(),
    });

    const res = await service.scrape(input({ resultsWanted: 2 }));

    expect(res.jobs).toHaveLength(2);
    const detailCalls = mockGet.mock.calls.filter((c) =>
      String(c[0]).endsWith('/detail'),
    );
    expect(detailCalls).toHaveLength(2);
  });

  it('returns empty results when no companySlug is provided', async () => {
    const res = await service.scrape(input({ companySlug: undefined }));
    expect(res.jobs).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('returns empty results when the list fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('network down'));
    const res = await service.scrape(input());
    expect(res.jobs).toHaveLength(0);
  });
});
