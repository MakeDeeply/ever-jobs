import 'reflect-metadata';
import {
  CompensationInterval,
  DescriptionFormat,
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

import { AdpService } from '../src/adp.service';
import { AdpJob } from '../src/adp.types';

const LIST_RE = /\/job-requisitions\?cid=([^&]+)/;
const DETAIL_RE = /\/job-requisitions\/([^/?]+)\?cid=/;

function listing(overrides: Partial<AdpJob> = {}): AdpJob {
  return {
    itemID: '9201050875412_1',
    requisitionTitle: 'VP, Government Affairs',
    postDate: '2026-06-29T16:54:00.000-04:00',
    workLevelCode: { shortName: 'Full Time' },
    payGradeRange: {
      minimumRate: { amountValue: 225000, currencyCode: 'USD' },
      maximumRate: { amountValue: 275000, currencyCode: 'USD' },
    },
    customFieldGroup: {
      stringFields: [
        {
          nameCode: { codeValue: 'SalaryRange' },
          stringValue: '225000.00 To 275000.00 (USD) Annually',
        },
      ],
    },
    requisitionLocations: [
      {
        nameCode: { shortName: 'Washington, DC, US' },
        address: {
          cityName: 'Washington',
          countrySubdivisionLevel1: { codeValue: 'DC' },
        },
      },
    ],
    ...overrides,
  };
}

/**
 * Route the mocked GET: 404 (reject) any host that is not `onHost`, so the
 * service's host fallback is exercised. The matching host serves the list and,
 * for each itemID present in `detailById`, the per-requisition detail.
 */
function mockApi(
  jobs: AdpJob[],
  detailById: Record<string, AdpJob | Error> = {},
  onHost = 'workforcenow.adp.com',
) {
  mockGet.mockImplementation((url: string) => {
    if (!url.includes(onHost)) {
      return Promise.reject(new Error(`GET ${url} failed: 404`));
    }
    const detailMatch = url.match(DETAIL_RE);
    if (detailMatch) {
      const entry = detailById[decodeURIComponent(detailMatch[1])];
      if (entry == null) return Promise.reject(new Error('404'));
      if (entry instanceof Error) return Promise.reject(entry);
      return Promise.resolve({ data: entry });
    }
    if (LIST_RE.test(url)) {
      return Promise.resolve({
        data: { jobRequisitions: jobs, meta: { totalNumber: jobs.length } },
      });
    }
    return Promise.reject(new Error(`unexpected url ${url}`));
  });
}

/**
 * Paginated variant: `pages` is served in `$skip` order — request N returns
 * `pages[N]` — and the first response carries `meta.totalNumber` (the full
 * count), matching the live API.
 */
function mockApiPaged(pages: (AdpJob[] | Error)[], total: number) {
  mockGet.mockImplementation((url: string) => {
    if (!url.includes('workforcenow.adp.com')) {
      return Promise.reject(new Error(`GET ${url} failed: 404`));
    }
    if (LIST_RE.test(url)) {
      const skip = Number(/\$skip=(\d+)/.exec(url)?.[1] ?? 0);
      const page = pages[skip / 20];
      if (page instanceof Error) return Promise.reject(page);
      return Promise.resolve({
        data: {
          jobRequisitions: page ?? [],
          meta: skip === 0 ? { totalNumber: total } : {},
        },
      });
    }
    // details are not the subject here — return the bare requisition
    const detailMatch = url.match(DETAIL_RE);
    if (detailMatch) {
      return Promise.resolve({ data: listing({ itemID: decodeURIComponent(detailMatch[1]) }) });
    }
    return Promise.reject(new Error(`unexpected url ${url}`));
  });
}

const pageOf = (start: number, size: number): AdpJob[] =>
  Array.from({ length: size }, (_, i) =>
    listing({ itemID: `req-${start + i}`, requisitionTitle: `Job ${start + i}` }),
  );

function input(overrides: Partial<ScraperInputDto> = {}): ScraperInputDto {
  return {
    companySlug: 'cid-1',
    siteType: [Site.ADP],
    resultsWanted: 100,
    ...overrides,
  } as ScraperInputDto;
}

describe('AdpService', () => {
  let service: AdpService;

  beforeEach(() => {
    mockGet.mockReset();
    service = new AdpService();
  });

  it('maps the real API shape and overlays the detail-only description', async () => {
    mockApi([listing()], {
      '9201050875412_1': listing({
        requisitionDescription: '<div><p>Lead policy work.</p></div>',
      }),
    });

    const res = await service.scrape(
      input({ descriptionFormat: DescriptionFormat.PLAIN }),
    );

    expect(res.jobs).toHaveLength(1);
    const job = res.jobs[0];
    expect(job.title).toBe('VP, Government Affairs');
    expect(job.description).toBe('Lead policy work.');
    expect(job.location?.city).toBe('Washington');
    expect(job.location?.state).toBe('DC');
    expect(job.employmentType).toBe('Full Time');
    expect(job.isRemote).toBe(false);
    expect(job.compensation?.minAmount).toBe(225000);
    expect(job.compensation?.maxAmount).toBe(275000);
    expect(job.compensation?.currency).toBe('USD');
    expect(job.compensation?.interval).toBe(CompensationInterval.YEARLY);
    expect(job.site).toBe(Site.ADP);
    expect(job.atsType).toBe('adp');
    expect(job.atsId).toBe('9201050875412_1');
    expect(job.id).toBe('adp-9201050875412_1');
    expect(job.jobUrl).toContain('jobId=9201050875412_1');
  });

  it('falls back to the cloud host when the primary host 404s', async () => {
    mockApi(
      [listing({ requisitionLocations: [{ nameCode: { shortName: 'Remote, US' } }] })],
      {
        '9201050875412_1': listing({
          requisitionDescription: '<p>Body</p>',
          requisitionLocations: [{ nameCode: { shortName: 'Remote, US' } }],
        }),
      },
      'workforcenow.cloud.adp.com',
    );

    const res = await service.scrape(input({ companySlug: 'cid-2' }));

    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('workforcenow.cloud.adp.com'),
    );
    expect(res.jobs).toHaveLength(1);
    expect(res.jobs[0].title).toBe('VP, Government Affairs');
    expect(res.jobs[0].isRemote).toBe(true);
    expect(res.jobs[0].workFromHomeType).toBe('Remote');
  });

  it('returns an empty result for a company with no open requisitions', async () => {
    mockApi([]);

    const res = await service.scrape(input());

    expect(res.jobs).toHaveLength(0);
  });

  it('still maps a job when its detail fetch fails (list-only fallback)', async () => {
    mockApi([listing()], { '9201050875412_1': new Error('boom') });

    const res = await service.scrape(input());

    expect(res.jobs).toHaveLength(1);
    expect(res.jobs[0].title).toBe('VP, Government Affairs');
    expect(res.jobs[0].description).toBeNull();
  });

  // Spec 5121 — structured per-site locations with `text` verbatim.
  it('emits per-site locations[] from structured requisitionLocations', async () => {
    mockApi([
      listing({
        requisitionLocations: [
          {
            nameCode: { shortName: 'Washington, DC, US' },
            address: {
              cityName: 'Washington',
              countrySubdivisionLevel1: { codeValue: 'DC' },
              countryCode: 'US',
            },
          },
          {
            nameCode: { shortName: 'Arlington, VA, US' },
            address: {
              cityName: 'Arlington',
              countrySubdivisionLevel1: { codeValue: 'VA' },
              countryCode: 'US',
            },
          },
        ],
      }),
    ]);

    const res = await service.scrape(input());

    expect(res.jobs[0].locations).toMatchObject([
      {
        city: 'Washington',
        state: 'DC',
        country: 'United States',
        text: 'Washington, DC, US',
      },
      {
        city: 'Arlington',
        state: 'VA',
        country: 'United States',
        text: 'Arlington, VA, US',
      },
    ]);
  });

  it('keeps the shortName in text when a requisitionLocation has no address', async () => {
    mockApi([
      listing({
        requisitionLocations: [
          { nameCode: { shortName: 'Austin, TX' } },
          { nameCode: { shortName: 'Remote, US' } },
        ],
      }),
    ]);

    const res = await service.scrape(input());

    expect(res.jobs[0].locations).toMatchObject([
      { city: 'Austin', state: 'TX', text: 'Austin, TX' },
      { country: 'United States', text: 'Remote, US' },
    ]);
    expect(res.jobs[0].isRemote).toBe(true);
  });

  // Spec 5133 — the list endpoint caps at 20 per response; walk $skip pages
  // until meta.totalNumber is covered.
  it('pages through the full requisition list', async () => {
    mockApiPaged([pageOf(0, 20), pageOf(20, 20), pageOf(40, 5)], 45);

    const res = await service.scrape(input({ resultsWanted: 9999 }));

    expect(res.jobs).toHaveLength(45);
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('$skip=20'));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('$skip=40'));
  });

  it('stops at resultsWanted before paging past the cap', async () => {
    mockApiPaged([pageOf(0, 20), pageOf(20, 20)], 40);

    const res = await service.scrape(input({ resultsWanted: 25 }));

    expect(res.jobs).toHaveLength(25);
  });

  it('keeps partial results when a later page fetch fails', async () => {
    mockApiPaged([pageOf(0, 20), new Error('boom'), pageOf(40, 5)], 45);

    const res = await service.scrape(input({ resultsWanted: 9999 }));

    expect(res.jobs).toHaveLength(20);
  });

  it('stops on an empty page even when totalNumber is higher', async () => {
    mockApiPaged([pageOf(0, 20), []], 60);

    const res = await service.scrape(input({ resultsWanted: 9999 }));

    expect(res.jobs).toHaveLength(20);
  });

  it('returns empty when no host resolves the company', async () => {
    mockGet.mockRejectedValue(new Error('404'));

    const res = await service.scrape(input());

    expect(res.jobs).toHaveLength(0);
  });
});
