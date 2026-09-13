import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { Country, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { PulsespaceService } from '../src/pulsespace.service';

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(),
  };
});

const careersFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'careers.html'),
  'utf8',
);
const bundleFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'bundle.js'),
  'utf8',
);

describe('PulsespaceService', () => {
  let service: PulsespaceService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new PulsespaceService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockBothFixtures(): void {
    getMock.mockImplementation((url: string) => {
      if (url === 'https://pulsespace.com/careers') {
        return Promise.resolve({ data: careersFixture });
      }
      if (url.includes('/assets/index-')) {
        return Promise.resolve({ data: bundleFixture });
      }
      return Promise.resolve({ data: '' });
    });
  }

  it('returns the open roles from the careers page JS bundle', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(5);
    expect(response.jobs[0].title).toBe('Principal Avionics Architect – Satellite Systems');
  });

  it('sets Pulse Space metadata and site', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.site).toBe(Site.PULSESPACE);
    expect(job.companyName).toBe('Pulse Space');
    expect(job.companyUrl).toBe('https://pulsespace.com');
    expect(job.jobUrl).toBe('https://pulsespace.com/careers/principal-avionics-architect');
    expect(job.jobUrlDirect).toBe('https://pulsespace.com/careers/principal-avionics-architect');
    expect(job.id).toBe('pulsespace-principal-avionics-architect');
  });

  it('extracts location, employment, and department metadata', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.location?.city).toBe('Seattle');
    expect(job.location?.state).toBe('WA');
    expect(job.location?.country).toBe(Country.USA);
    expect(job.location?.displayLocation()).toBe('Seattle, WA, USA');
    expect(job.jobType).toEqual([JobType.FULL_TIME]);
    expect(job.employmentType).toBe('Full time');
    expect(job.isRemote).toBe(false);
    expect(job.workFromHomeType).toBeUndefined();
    expect(job.department).toBe('Engineering / Avionics Systems');
  });

  it('leaves applyUrl blank because no application path is exposed', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs[0].applyUrl).toBeUndefined();
  });

  it('extracts the full role description from sections', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.description).toContain('Position Summary');
    expect(job.description).toContain('Key Responsibilities');
    expect(job.description).toContain('Basic Qualifications');
    expect(job.description).toContain('Preferred Qualifications');
    expect(job.description).toContain('Competencies');
  });

  it('filters by searchTerm', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'Avionics', resultsWanted: 999 }),
    );

    expect(response.jobs.length).toBeGreaterThan(0);

    const empty = await service.scrape(
      new ScraperInputDto({ searchTerm: 'xyznope', resultsWanted: 999 }),
    );
    expect(empty.jobs).toHaveLength(0);
  });

  it('filters by location', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ location: 'Seattle', resultsWanted: 999 }),
    );

    expect(response.jobs.length).toBeGreaterThan(0);
  });

  it('filters by isRemote', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ isRemote: true, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(0);
  });

  it('filters by jobType', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ jobType: JobType.FULL_TIME, resultsWanted: 999 }),
    );

    expect(response.jobs.length).toBe(5);
  });

  it('applies offset and resultsWanted', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ offset: 3, resultsWanted: 1 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].id).toBe('pulsespace-principal-mechanical-architect');
  });

  it('uses the provided companyUrl for the initial request and resolves bundle links against it', async () => {
    const customUrl = 'https://example.com/careers';
    getMock.mockImplementation((url: string) => {
      if (url === customUrl) {
        return Promise.resolve({ data: careersFixture });
      }
      if (url.includes('/assets/index-')) {
        return Promise.resolve({ data: bundleFixture });
      }
      return Promise.resolve({ data: '' });
    });

    const response = await service.scrape(
      new ScraperInputDto({ companyUrl: customUrl, resultsWanted: 999 }),
    );

    expect(getMock).toHaveBeenCalledWith(customUrl);
    expect(response.jobs[0].companyUrl).toBe(customUrl);
    expect(response.jobs[0].jobUrl).toBe(
      'https://example.com/careers/principal-avionics-architect',
    );
  });

  it('returns an empty list when the careers page has no JS bundle', async () => {
    getMock.mockResolvedValueOnce({
      data: '<html><head></head><body><h1>Open Positions</h1></body></html>',
    });

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
  });
});
