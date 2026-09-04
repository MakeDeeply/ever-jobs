import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { TheSpaceportcompanyService } from '../src/thespaceportcompany.service';

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(),
  };
});

const fixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'careers.html'),
  'utf8',
);

describe('TheSpaceportcompanyService', () => {
  let service: TheSpaceportcompanyService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new TheSpaceportcompanyService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the two visible jobs and ignores hidden draft sections', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(2);
    const titles = response.jobs.map((job) => job.title);
    expect(titles).toContain('Mechanical Engineer');
    expect(titles).toContain('Naval Architect');
    expect(titles).not.toContain('Propulsion Engineer');
    expect(titles).not.toContain('Electrical Engineer');
  });

  it('sets The Spaceport Company metadata and apply URL', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.site).toBe(Site.THE_SPACEPORT_COMPANY);
      expect(job.companyName).toBe('The Spaceport Company');
      expect(job.companyUrl).toBe('https://thespaceportcompany.com/careers/');
      expect(job.jobUrl).toBe('https://thespaceportcompany.com/careers/');
      expect(job.jobUrlDirect).toBe('https://thespaceportcompany.com/careers/');
      expect(job.applyUrl).toBe('mailto:info@thespaceportcompany.com');
      expect(job.isRemote).toBe(false);
      expect(job.workFromHomeType).toBe('On Site');
      expect(job.jobType).toEqual([JobType.FULL_TIME]);
      expect(job.employmentType).toBe('Full time');
    }
  });

  it('extracts location for Mechanical Engineer and Naval Architect', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const mechanical = response.jobs.find((job) => job.title === 'Mechanical Engineer')!;
    expect(mechanical.location?.city).toBe('Merritt Island');
    expect(mechanical.location?.state).toBe('FL');
    expect(mechanical.location?.country).toBe('USA');
    expect(mechanical.location?.displayLocation()).toMatch(/Merritt Island/);

    const naval = response.jobs.find((job) => job.title === 'Naval Architect')!;
    expect(naval.location?.city).toBe('Cocoa');
    expect(naval.location?.state).toBe('FL');
    expect(naval.location?.country).toBe('USA');
    expect(naval.location?.displayLocation()).toMatch(/Cocoa/);
  });

  it('builds a markdown description from the overview and accordion sections', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const mechanical = response.jobs.find((job) => job.title === 'Mechanical Engineer')!;
    expect(mechanical.description).toContain('## ');
    expect(mechanical.description).toContain('The Spaceport Company');
    expect(mechanical.description).toContain('Mechanical');
  });

  it('filters by searchTerm', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'Naval', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Naval Architect');
  });

  it('filters by location', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ location: 'Cocoa', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Naval Architect');
  });

  it('applies offset and resultsWanted', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ offset: 1, resultsWanted: 1 }));

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Naval Architect');
  });

  it('uses the provided companyUrl for the initial request', async () => {
    const customUrl = 'https://example.com/careers/';
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ companyUrl: customUrl, resultsWanted: 999 }),
    );

    expect(getMock).toHaveBeenCalledWith(customUrl);
    expect(response.jobs[0].companyUrl).toBe(customUrl);
  });

  it('returns diagnostics when the Open Positions list is missing', async () => {
    getMock.mockResolvedValueOnce({ data: '<html><head></head><body></body></html>' });

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
    expect(response.diagnostics).toBeDefined();
  });
});
