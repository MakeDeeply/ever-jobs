import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { Country, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { GengalacticService } from '../src/gengalactic.service';

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
const detailFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'electric-propulsion-test-engineer.html'),
  'utf8',
);

describe('GengalacticService', () => {
  let service: GengalacticService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new GengalacticService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockBothFixtures(): void {
    getMock.mockImplementation((url: string) => {
      if (url === 'https://gengalactic.com/careers') {
        return Promise.resolve({ data: careersFixture });
      }
      if (url.includes('/careers/')) {
        return Promise.resolve({ data: detailFixture });
      }
      return Promise.resolve({ data: '' });
    });
  }

  it('returns all open roles from the listing page', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(3);
    expect(response.jobs[0].title).toBe('Electric Propulsion Test Engineer');
    expect(response.jobs[1].title).toBe('Fall Engineering Internship');
    expect(response.jobs[2].title).toBe('Facilities Manager');
  });

  it('sets General Galactic metadata and site', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.site).toBe(Site.GENGALACTIC);
    expect(job.companyName).toBe('General Galactic');
    expect(job.companyUrl).toBe('https://gengalactic.com/careers');
    expect(job.jobUrl).toBe('https://gengalactic.com/careers/electric-propulsion-test-engineer');
    expect(job.jobUrlDirect).toBe('https://gengalactic.com/careers/electric-propulsion-test-engineer');
    expect(job.id).toBe('gengalactic-electric-propulsion-test-engineer');
  });

  it('extracts location, employment type, and remote status', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.location?.city).toBe('El Segundo');
    expect(job.location?.state).toBe('CA');
    expect(job.location?.country).toBe(Country.USA);
    expect(job.jobType).toEqual([JobType.FULL_TIME]);
    expect(job.employmentType).toBe('Full time');
    expect(job.isRemote).toBe(false);
    expect(job.workFromHomeType).toBeUndefined();
  });

  it('derives internship job type from the title when employment badge is empty', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const intern = response.jobs[1];
    expect(intern.title).toBe('Fall Engineering Internship');
    expect(intern.jobType).toEqual([JobType.INTERNSHIP]);
    expect(intern.employmentType).toBe('Internship');
  });

  it('resolves the apply email from the listing page', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.applyUrl).toBe('mailto:careers@gengalactic.com');
    expect(job.emails).toEqual(['careers@gengalactic.com']);
  });

  it('extracts the role description from the article', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.description).toContain('About General Galactic');
    expect(job.description).toContain('Job Description');
    expect(job.description).toContain('Requirements');
    expect(job.description).toContain('careers@gengalactic.com');
  });

  it('filters by searchTerm', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'internship', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Fall Engineering Internship');
  });

  it('filters by location', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ location: 'El Segundo', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(3);
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
      new ScraperInputDto({ jobType: JobType.INTERNSHIP, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Fall Engineering Internship');
  });

  it('applies offset and resultsWanted', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ offset: 1, resultsWanted: 1 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Fall Engineering Internship');
  });

  it('uses the provided companyUrl for the initial request and resolves detail links against it', async () => {
    const customUrl = 'https://example.com/careers.html';
    getMock.mockImplementation((url: string) => {
      if (url === customUrl) {
        return Promise.resolve({ data: careersFixture });
      }
      if (url.includes('/careers/')) {
        return Promise.resolve({ data: detailFixture });
      }
      return Promise.resolve({ data: '' });
    });

    const response = await service.scrape(
      new ScraperInputDto({ companyUrl: customUrl, resultsWanted: 999 }),
    );

    expect(getMock).toHaveBeenCalledWith(customUrl);
    expect(response.jobs[0].companyUrl).toBe(customUrl);
    expect(response.jobs[0].jobUrl).toBe('https://example.com/careers/electric-propulsion-test-engineer');
  });

  it('returns an empty list when the careers page has no open roles', async () => {
    getMock.mockResolvedValueOnce({
      data: '<html><head></head><body><h1>Open Positions</h1></body></html>',
    });

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
  });
});
