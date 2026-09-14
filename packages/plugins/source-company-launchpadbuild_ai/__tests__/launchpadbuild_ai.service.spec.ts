import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { CompensationInterval, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { LaunchpadbuildAiService } from '../src/launchpadbuild_ai.service';

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(),
  };
});

const careersFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'launchpadbuild_ai-careers.html'),
  'utf8',
);
const aiEngineerFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'launchpadbuild_ai-ai-data-engineer.html'),
  'utf8',
);
const technicianFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'launchpadbuild_ai-technician.html'),
  'utf8',
);

describe('LaunchpadbuildAiService', () => {
  let service: LaunchpadbuildAiService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new LaunchpadbuildAiService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockResponses() {
    getMock
      .mockResolvedValueOnce({ data: careersFixture })
      .mockResolvedValueOnce({ data: aiEngineerFixture })
      .mockResolvedValueOnce({ data: technicianFixture });
  }

  it('scrapes the awsm-job-listings list and returns both jobs', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(2);
    const titles = response.jobs.map((job) => job.title);
    expect(titles).toContain('AI & Data Engineer — Launchpad Build AI');
    expect(titles).toContain('Technician I');
  });

  it('sets Launchpad Build AI company metadata, job URLs, and apply URL', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const ai = response.jobs.find((job) => job.title === 'AI & Data Engineer — Launchpad Build AI')!;
    expect(ai.site).toBe(Site.LAUNCHPADBUILD_AI);
    expect(ai.companyName).toBe('Launchpad Build AI');
    expect(ai.companyUrl).toBe('https://www.launchpadbuild.ai/careers/');
    expect(ai.jobUrl).toBe('https://www.launchpadbuild.ai/jobs/ai-data-engineer-launchpad-build-ai/');
    expect(ai.jobUrlDirect).toBe(ai.jobUrl);
    expect(ai.applyUrl).toBe(ai.jobUrl);
  });

  it('extracts UK country and Hybrid from the Why Launchpad section for the AI role', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const ai = response.jobs.find((job) => job.title === 'AI & Data Engineer — Launchpad Build AI')!;
    expect(ai.location?.country).toBe('UK');
    expect(ai.location?.city).toBeUndefined();
    expect(ai.location?.state).toBeUndefined();
    expect(ai.location?.displayLocation()).toBe('UK');
    expect(ai.workFromHomeType).toBe('Hybrid');
    expect(ai.isRemote).toBe(false);
  });

  it('extracts El Segundo, CA location and On Site schedule for the Technician role', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const tech = response.jobs.find((job) => job.title === 'Technician I')!;
    expect(tech.location?.city).toBe('El Segundo');
    expect(tech.location?.state).toBe('CA');
    expect(tech.location?.country).toBe('USA');
    expect(tech.location?.displayLocation()).toBe('El Segundo, CA, USA');
    expect(tech.workFromHomeType).toBe('On Site');
    expect(tech.isRemote).toBe(false);
  });

  it('prefers the annual compensation range when both hourly and yearly figures appear', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const tech = response.jobs.find((job) => job.title === 'Technician I')!;
    expect(tech.compensation?.minAmount).toBe(41600);
    expect(tech.compensation?.maxAmount).toBe(54080);
    expect(tech.compensation?.currency).toBe('USD');
    expect(tech.compensation?.interval).toBe(CompensationInterval.YEARLY);
  });

  it('sets FULL_TIME job type and employment type for both roles', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.jobType).toEqual([JobType.FULL_TIME]);
      expect(job.employmentType).toBe('Full time');
    }
  });

  it('builds a markdown description from section headings and content', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const ai = response.jobs.find((job) => job.title === 'AI & Data Engineer — Launchpad Build AI')!;
    expect(ai.description).toContain('## About Launchpad Build AI');
    expect(ai.description).toContain('## Position Summary');
    expect(ai.description).toContain('## Why Launchpad');
    expect(ai.description).toContain('UK based with hybrid options');

    const tech = response.jobs.find((job) => job.title === 'Technician I')!;
    expect(tech.description).toContain('## Compensation & Benefits');
    expect(tech.description).toContain('$41,600');
  });

  it('filters by searchTerm', async () => {
    mockResponses();

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'technician', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Technician I');
  });

  it('filters by location', async () => {
    mockResponses();

    const response = await service.scrape(
      new ScraperInputDto({ location: 'UK', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('AI & Data Engineer — Launchpad Build AI');
  });

  it('returns no jobs when isRemote is true', async () => {
    mockResponses();

    const response = await service.scrape(
      new ScraperInputDto({ isRemote: true, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(0);
  });

  it('filters by jobType FULL_TIME', async () => {
    mockResponses();

    const response = await service.scrape(
      new ScraperInputDto({ jobType: JobType.FULL_TIME, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(2);
  });

  it('applies offset and resultsWanted', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ offset: 1, resultsWanted: 1 }));

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Technician I');
  });

  it('uses the provided companyUrl for the initial request', async () => {
    const customUrl = 'https://example.com/careers/';
    getMock
      .mockResolvedValueOnce({ data: careersFixture })
      .mockResolvedValueOnce({ data: aiEngineerFixture })
      .mockResolvedValueOnce({ data: technicianFixture });

    const response = await service.scrape(
      new ScraperInputDto({ companyUrl: customUrl, resultsWanted: 999 }),
    );

    expect(getMock).toHaveBeenNthCalledWith(1, customUrl);
    expect(response.jobs[0].companyUrl).toBe(customUrl);
  });

  it('returns diagnostics when the awsm-job-listings container is missing', async () => {
    getMock.mockResolvedValueOnce({ data: '<html><head></head><body></body></html>' });

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
    expect(response.diagnostics).toBeDefined();
    expect(response.diagnostics!.detail).toMatch(/awsm-job-listings/);
  });
});
