/**
 * Unit tests for the Lever field mappings added in spec 752:
 * compensation, department, multi-location, workFromHomeType, and the ISO-2
 * country fold-in. Drives the public scraping path with a mocked HTTP client.
 */
import { Test, TestingModule } from '@nestjs/testing';
import {
  ScraperInputDto,
  Site,
  CompensationInterval,
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

import { LeverModule, LeverService } from '@ever-jobs/source-ats-lever';

async function scrapeOne(job: Record<string, unknown>) {
  mockGet.mockResolvedValueOnce({ data: [job] });
  const module: TestingModule = await Test.createTestingModule({
    imports: [LeverModule],
  }).compile();
  const service = module.get<LeverService>(LeverService);
  const input = new ScraperInputDto({
    siteType: [Site.LEVER],
    companySlug: 'crgo',
    resultsWanted: 5,
  });
  const response = await service.scrape(input);
  expect(response.jobs).toHaveLength(1);
  return response.jobs[0];
}

describe('LeverService field mappings (spec 752)', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockSetHeaders.mockReset();
    delete process.env.LEVER_API_KEY;
  });

  it('should map salaryRange to compensation honoring the real interval', async () => {
    const job = await scrapeOne({
      id: 'comp-hourly',
      text: 'Machinist',
      salaryRange: {
        min: 20.14,
        max: 24.9,
        currency: 'USD',
        interval: 'per-hour-wage',
      },
    });

    expect(job.compensation).toBeDefined();
    expect(job.compensation?.interval).toBe(CompensationInterval.HOURLY);
    expect(job.compensation?.minAmount).toBe(20.14);
    expect(job.compensation?.maxAmount).toBe(24.9);
    expect(job.compensation?.currency).toBe('USD');
  });

  it('should resolve per-year and per-month interval tokens', async () => {
    const yearly = await scrapeOne({
      id: 'comp-yearly',
      text: 'Engineer',
      salaryRange: { min: 120000, max: 160000, currency: 'USD', interval: 'per-year-salary' },
    });
    expect(yearly.compensation?.interval).toBe(CompensationInterval.YEARLY);

    const monthly = await scrapeOne({
      id: 'comp-monthly',
      text: 'Contractor',
      salaryRange: { min: 8000, max: 9000, currency: 'USD', interval: 'per-month-salary' },
    });
    expect(monthly.compensation?.interval).toBe(CompensationInterval.MONTHLY);
  });

  it('should leave compensation null when no salaryRange is present', async () => {
    const job = await scrapeOne({ id: 'no-comp', text: 'Role' });
    expect(job.compensation).toBeNull();
  });

  it('should fall back to the description salary when salaryRange is absent (Spec 5018)', async () => {
    const job = await scrapeOne({
      id: 'comp-text',
      text: 'Engineer',
      descriptionPlain:
        'We offer a base salary of $120,000 - $160,000 per year plus equity.',
    });
    expect(job.compensation).toBeDefined();
    expect(job.compensation?.minAmount).toBe(120000);
    expect(job.compensation?.maxAmount).toBe(160000);
    expect(job.compensation?.currency).toBe('USD');
  });

  it('should prefer structured salaryRange over a description salary (Spec 5018)', async () => {
    const job = await scrapeOne({
      id: 'comp-both',
      text: 'Engineer',
      salaryRange: { min: 90000, max: 100000, currency: 'EUR', interval: 'per-year-salary' },
      descriptionPlain: 'Range listed in body: $120,000 - $160,000 per year.',
    });
    expect(job.compensation?.minAmount).toBe(90000);
    expect(job.compensation?.maxAmount).toBe(100000);
    expect(job.compensation?.currency).toBe('EUR');
  });

  it('should leave compensation null when neither structured nor text has a salary (Spec 5018)', async () => {
    const job = await scrapeOne({
      id: 'comp-none',
      text: 'Engineer',
      descriptionPlain: 'A great team working on hard problems. 5+ years required.',
    });
    expect(job.compensation).toBeNull();
  });

  it('should map categories.department independently of team', async () => {
    const job = await scrapeOne({
      id: 'dept',
      text: 'CNC Operator',
      categories: { department: 'Manufacturing', team: 'CNC' },
    });
    expect(job.department).toBe('Manufacturing');
    expect(job.team).toBe('CNC');
  });

  it('should join multi-site allLocations into a single location', async () => {
    const job = await scrapeOne({
      id: 'multi',
      text: 'Technician',
      categories: {
        location: 'Nashua, NH',
        allLocations: ['Nashua, NH', 'Brooklyn Park, MN'],
      },
    });
    expect(job.location?.city).toBe('Nashua, NH; Brooklyn Park, MN');
  });

  it('should set workFromHomeType Hybrid without marking the job remote', async () => {
    const job = await scrapeOne({
      id: 'hybrid',
      text: 'Designer',
      categories: { location: 'Austin, TX' },
      workplaceType: 'hybrid',
    });
    expect(job.workFromHomeType).toBe('Hybrid');
    expect(job.isRemote).toBe(false);
  });

  it('should set Remote and isRemote from workplaceType remote', async () => {
    const job = await scrapeOne({
      id: 'remote',
      text: 'SRE',
      categories: { location: 'San Francisco, CA' },
      workplaceType: 'remote',
    });
    expect(job.workFromHomeType).toBe('Remote');
    expect(job.isRemote).toBe(true);
  });

  it('should fold a non-US ISO-2 country code into the location', async () => {
    const job = await scrapeOne({
      id: 'country',
      text: 'Operator',
      categories: { location: 'Amsterdam' },
      country: 'NL',
    });
    expect(job.location?.country).toBe('Netherlands');
  });

  it('should ignore an unresolvable country code', async () => {
    const job = await scrapeOne({
      id: 'bad-country',
      text: 'Operator',
      categories: { location: 'Nashua, NH' },
      country: 'QZ',
    });
    expect(job.location?.city).toBe('Nashua');
    expect(job.location?.state).toBe('NH');
    expect(job.location?.country).toBeFalsy();
  });
});
