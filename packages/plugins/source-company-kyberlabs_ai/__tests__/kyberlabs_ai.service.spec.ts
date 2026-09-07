import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { Country, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { KyberlabsAiService } from '../src/kyberlabs_ai.service';

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(),
  };
});

const fixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'jobs.html'),
  'utf8',
);

describe('KyberlabsAiService', () => {
  let service: KyberlabsAiService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new KyberlabsAiService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the two visible Kyber Labs roles and skips headings without an apply link', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(2);
    const titles = response.jobs.map((job) => job.title);
    expect(titles).toContain('Mechanical Engineer');
    expect(titles).toContain('Senior Electrical Engineer');
    expect(titles).not.toContain('Open Positions');
  });

  it('sets Kyber Labs metadata and site', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.site).toBe(Site.KYBERLABS_AI);
      expect(job.companyName).toBe('Kyber Labs');
      expect(job.companyUrl).toBe('https://kyberlabs.ai');
      expect(job.jobUrl).toBe('https://kyberlabs.ai/jobs');
      expect(job.jobUrlDirect).toBe('https://kyberlabs.ai/jobs');
      expect(job.jobType).toEqual([JobType.FULL_TIME]);
      expect(job.employmentType).toBe('Full time');
    }
  });

  it('extracts Brooklyn, NY locations', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.location?.city).toBe('Brooklyn');
      expect(job.location?.state).toBe('NY');
      expect(job.location?.country).toBe(Country.USA);
    }
  });

  it('resolves relative apply links and preserves absolute apply links', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const mechanical = response.jobs.find((job) => job.title === 'Mechanical Engineer')!;
    expect(mechanical.applyUrl).toBe('https://kyberlabs.ai/mech');
    expect(mechanical.isRemote).toBe(false);
    expect(mechanical.workFromHomeType).toBe('On Site');

    const senior = response.jobs.find((job) => job.title === 'Senior Electrical Engineer')!;
    expect(senior.applyUrl).toBe('https://external.example.com/apply');
    expect(senior.isRemote).toBe(true);
    expect(senior.workFromHomeType).toBe('Remote');
  });

  it('filters by searchTerm', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'Electrical', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Senior Electrical Engineer');
  });

  it('filters by location', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ location: 'Brooklyn', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(2);
  });

  it('filters by isRemote', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ isRemote: true, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Senior Electrical Engineer');
  });

  it('filters by jobType', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ jobType: JobType.FULL_TIME, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(2);
  });

  it('applies offset and resultsWanted', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ offset: 1, resultsWanted: 1 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Senior Electrical Engineer');
  });

  it('uses the provided companyUrl for the initial request and resolves apply links against it', async () => {
    const customUrl = 'https://example.com/careers';
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ companyUrl: customUrl, resultsWanted: 999 }),
    );

    expect(getMock).toHaveBeenCalledWith(customUrl);
    expect(response.jobs[0].companyUrl).toBe(customUrl);
    expect(response.jobs[0].applyUrl).toBe('https://example.com/careers/mech');
  });

  it('returns an empty list when the careers page has no open roles', async () => {
    getMock.mockResolvedValueOnce({
      data: '<html><head></head><body></body></html>',
    });

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
  });

  it('deduplicates jobs by id', async () => {
    const duplicate = fixture.replace(
      'Senior Electrical Engineer',
      'Mechanical Engineer',
    );
    getMock.mockResolvedValueOnce({ data: duplicate });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Mechanical Engineer');
  });
});
