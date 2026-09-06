import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { Country, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { DeftaiCoService } from '../src/deftai_co.service';

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(),
  };
});

const fixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'deftai-careers.html'),
  'utf8',
);

describe('DeftaiCoService', () => {
  let service: DeftaiCoService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new DeftaiCoService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the nine visible Deft Robotics roles', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(9);
    const titles = response.jobs.map((job) => job.title);
    expect(titles).toContain('Research Scientist');
    expect(titles).toContain('Machine Learning Engineer');
    expect(titles).toContain('Systems Engineer');
    expect(titles).toContain('Controls Engineer');
    expect(titles).toContain('Product Design Engineer');
    expect(titles).toContain('Forward Deployed Engineer');
    expect(titles).toContain('Robot Technician');
    expect(titles).toContain('Robot Pilot');
    expect(titles).toContain('GTM Lead');
    expect(titles).not.toContain('CASE STUDIES');
  });

  it('sets Deft Robotics metadata and site', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.site).toBe(Site.DEFTAI_CO);
      expect(job.companyName).toBe('Deft Robotics');
      expect(job.companyUrl).toBe('https://www.deftai.co');
      expect(job.isRemote).toBe(false);
      expect(job.workFromHomeType).toBe('On Site');
      expect(job.jobType).toEqual([JobType.FULL_TIME]);
      expect(job.employmentType).toBe('FULL_TIME');
      expect(job.jobUrl).toBe(job.applyUrl);
      expect(job.jobUrlDirect).toBe(job.applyUrl);
    }
  });

  it('extracts San Francisco, CA locations', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const scientist = response.jobs.find((job) => job.title === 'Research Scientist')!;
    expect(scientist.location?.city).toBe('San Francisco');
    expect(scientist.location?.state).toBe('CA');
    expect(scientist.location?.country).toBe(Country.USA);

    const gtm = response.jobs.find((job) => job.title === 'GTM Lead')!;
    expect(gtm.location?.city).toBe('San Francisco');
    expect(gtm.location?.state).toBe('CA');
    expect(gtm.location?.country).toBe(Country.USA);
  });

  it('normalizes Tally URLs and converts the GTM Lead embed URL', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.applyUrl).toMatch(/^https:\/\/tally\.so\/r\/[A-Za-z0-9]+$/);
    }

    const gtm = response.jobs.find((job) => job.title === 'GTM Lead')!;
    expect(gtm.applyUrl).toBe('https://tally.so/r/ODajNA');
  });

  it('does not include the referral form or CASE STUDIES promo', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const urls = response.jobs.map((job) => job.applyUrl);
    expect(urls).not.toContain('https://tally.so/r/5B1Myd');
    const titles = response.jobs.map((job) => job.title);
    expect(titles).not.toContain('CASE STUDIES');
  });

  it('filters by searchTerm', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'GTM Lead', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('GTM Lead');
  });

  it('filters by location', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ location: 'San Francisco', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(9);
  });

  it('applies offset and resultsWanted', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ offset: 1, resultsWanted: 1 }));

    expect(response.jobs).toHaveLength(1);
  });

  it('uses the provided companyUrl for the initial request', async () => {
    const customUrl = 'https://example.com/careers';
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ companyUrl: customUrl, resultsWanted: 999 }),
    );

    expect(getMock).toHaveBeenCalledWith(customUrl);
    expect(response.jobs[0].companyUrl).toBe(customUrl);
  });

  it('returns an empty list when the careers page has no open roles', async () => {
    getMock.mockResolvedValueOnce({ data: '<html><head></head><body></body></html>' });

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
  });
});
