import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CompensationInterval,
  DescriptionFormat,
  ScraperInputDto,
  Site,
} from '@ever-jobs/models';

const mockGet = jest.fn();
const mockSetHeaders = jest.fn();
jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(() => ({
      get: mockGet,
      setHeaders: mockSetHeaders,
    })),
  };
});

import { ManatalService } from '../src/manatal.service';

const FIX = join(__dirname, 'fixtures');
const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(join(FIX, name), 'utf-8'));

/** Route the mocked GET to a fixture (or inline object) by URL substring. */
function route(map: Array<[string | RegExp, unknown | Error]>) {
  mockGet.mockImplementation((url: string) => {
    for (const [matcher, value] of map) {
      const hit =
        typeof matcher === 'string' ? url.includes(matcher) : matcher.test(url);
      if (hit) {
        if (value instanceof Error) return Promise.reject(value);
        return Promise.resolve({ data: value });
      }
    }
    return Promise.reject(new Error(`unexpected url ${url}`));
  });
}

function input(overrides: Partial<ScraperInputDto> = {}): ScraperInputDto {
  return {
    companySlug: 'ghostwerks-llc',
    siteType: [Site.MANATAL],
    resultsWanted: 100,
    ...overrides,
  } as ScraperInputDto;
}

describe('ManatalService', () => {
  let service: ManatalService;

  beforeEach(() => {
    mockGet.mockReset();
    mockSetHeaders.mockReset();
    service = new ManatalService();
  });

  it('returns no jobs (and makes no request) without a companySlug', async () => {
    const res = await service.scrape(input({ companySlug: undefined }));
    expect(res.jobs).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('maps every job with stable ids, ATS metadata, and careers-page URLs', async () => {
    route([['/c/ghostwerks-llc/jobs/', fixture('list-ghostwerks.json')]]);
    const res = await service.scrape(input());

    expect(res.jobs).toHaveLength(6);
    for (const job of res.jobs) {
      expect(job.site).toBe(Site.MANATAL);
      expect(job.atsType).toBe('manatal');
      expect(job.companyName).toBe('ghostwerks-llc');
      expect(job.id).toMatch(/^manatal-\d+$/);
      expect(job.companyUrl).toBe(
        'https://www.careers-page.com/ghostwerks-llc',
      );
      expect(job.jobUrl).toMatch(
        /^https:\/\/www\.careers-page\.com\/ghostwerks-llc\/job\/[A-Z0-9]+$/,
      );
      expect(job.title).toBeTruthy();
    }
    // jobUrl uses the per-job hash, not the numeric id.
    const eng = res.jobs.find((j) => j.atsId === '3419131');
    expect(eng?.jobUrl).toBe(
      'https://www.careers-page.com/ghostwerks-llc/job/5WW46353',
    );
  });

  it('maps structured location fields (city/state/country)', async () => {
    route([['/c/ghostwerks-llc/jobs/', fixture('list-ghostwerks.json')]]);
    const res = await service.scrape(input());
    const job = res.jobs[0];
    expect(job.location?.city).toBe('Wharton');
    expect(job.location?.state).toBe('New Jersey');
    expect(job.location?.country).toBe('United States');
  });

  it('uses the structured salary (min/max + inferred yearly interval) when visible', async () => {
    route([['/c/ghostwerks-llc/jobs/', fixture('list-ghostwerks.json')]]);
    const res = await service.scrape(input());

    const visible = res.jobs.find((j) => j.atsId === '3419131');
    expect(visible?.compensation?.minAmount).toBe(60000);
    expect(visible?.compensation?.maxAmount).toBe(85000);
    expect(visible?.compensation?.currency).toBe('USD');
    expect(visible?.compensation?.interval).toBe(CompensationInterval.YEARLY);
    expect(visible?.salarySource).toBe('structured');
  });

  it('leaves compensation unset when salary is not visible and absent from text', async () => {
    route([['/c/ghostwerks-llc/jobs/', fixture('list-ghostwerks.json')]]);
    const res = await service.scrape(input());

    const hidden = res.jobs.find((j) => j.atsId === '3226536');
    expect(hidden?.compensation == null).toBe(true);
    expect(hidden?.salarySource == null).toBe(true);
  });

  it('falls back to salary parsed from the description text', async () => {
    route([['/c/calqulate/jobs/', fixture('list-calqulate.json')]]);
    const res = await service.scrape(input({ companySlug: 'calqulate' }));

    // "Base salary range: $65,000 – $90,000 annually" — not flagged visible.
    const job = res.jobs.find((j) => j.atsId === '3550612');
    expect(job?.compensation?.minAmount).toBe(65000);
    expect(job?.compensation?.maxAmount).toBe(90000);
    expect(job?.salarySource).toBe('description');
  });

  it('infers an hourly interval for small structured amounts', async () => {
    route([
      [/jobs\/\?page=2/, fixture('list-castelion-p2.json')],
      ['/c/castelion-corporation/jobs/', fixture('list-castelion-p1.json')],
    ]);
    const res = await service.scrape(
      input({ companySlug: 'castelion-corporation', resultsWanted: 10 }),
    );

    const hourly = res.jobs.find((j) => j.atsId === '3880458');
    expect(hourly?.compensation?.minAmount).toBe(40);
    expect(hourly?.compensation?.maxAmount).toBe(50);
    expect(hourly?.compensation?.interval).toBe(CompensationInterval.HOURLY);

    const yearly = res.jobs.find((j) => j.atsId === '3587114');
    expect(yearly?.compensation?.interval).toBe(CompensationInterval.YEARLY);
    expect(yearly?.compensation?.minAmount).toBe(140000);
  });

  it('follows the pagination chain until resultsWanted is met', async () => {
    route([
      [/jobs\/\?page=2/, fixture('list-castelion-p2.json')],
      ['/c/castelion-corporation/jobs/', fixture('list-castelion-p1.json')],
    ]);
    const res = await service.scrape(
      input({ companySlug: 'castelion-corporation', resultsWanted: 15 }),
    );

    expect(res.jobs).toHaveLength(15);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('does not page beyond the first response when it already satisfies the request', async () => {
    route([
      ['/c/castelion-corporation/jobs/', fixture('list-castelion-p1.json')],
    ]);
    await service.scrape(
      input({ companySlug: 'castelion-corporation', resultsWanted: 5 }),
    );
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('extracts emails from the description body', async () => {
    route([['/c/ghostwerks-llc/jobs/', fixture('list-ghostwerks.json')]]);
    const res = await service.scrape(input());
    const job = res.jobs.find((j) => j.atsId === '3419131');
    expect(job?.emails).toContain('info@ghostwerksllc.com');
  });

  it('respects the requested description format', async () => {
    route([['/c/ghostwerks-llc/jobs/', fixture('list-ghostwerks.json')]]);

    const html = (
      await service.scrape(input({ descriptionFormat: DescriptionFormat.HTML }))
    ).jobs[0];
    expect(html.description).toMatch(/<\w+/);

    const plain = (
      await service.scrape(input({ descriptionFormat: DescriptionFormat.PLAIN }))
    ).jobs[0];
    expect(plain.description).not.toMatch(/<\w+/);
  });

  it('derives isRemote / workFromHomeType from the location text', async () => {
    const remoteResponse = {
      count: 1,
      next: null,
      results: [
        {
          id: 999,
          hash: 'ZZZ123',
          position_name: 'Staff Engineer',
          description: '<p>Build things. Contact jobs@acme.test</p>',
          country: null,
          state: null,
          city: null,
          address: '',
          zipcode: '',
          location_display: 'Remote - United States',
          is_salary_visible: false,
        },
      ],
    };
    route([['/c/acme/jobs/', remoteResponse]]);
    const res = await service.scrape(input({ companySlug: 'acme' }));

    const job = res.jobs[0];
    expect(job.isRemote).toBe(true);
    expect(job.workFromHomeType).toBe('Remote');
    expect(job.emails).toContain('jobs@acme.test');
  });

  it('returns no jobs when the API call fails', async () => {
    route([[/.*/, new Error('boom')]]);
    const res = await service.scrape(input());
    expect(res.jobs).toHaveLength(0);
  });
});
