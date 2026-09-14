import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { Country, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { CascadeSpaceService } from '../src/cascade_space.service';

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
  path.join(__dirname, 'fixtures', 'mech-e.html'),
  'utf8',
);

describe('CascadeSpaceService', () => {
  let service: CascadeSpaceService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new CascadeSpaceService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockBothFixtures(): void {
    getMock.mockImplementation((url: string) => {
      if (url === 'https://cascade.space/careers/' || url.includes('/careers/')) {
        return Promise.resolve({
          data: url.includes('mech-e') ? detailFixture : careersFixture,
        });
      }
      return Promise.resolve({ data: '' });
    });
  }

  it('returns the open role from the listing and detail pages', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Senior Mechanical Engineer');
  });

  it('sets Cascade Space metadata and site', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.site).toBe(Site.CASCADE_SPACE);
    expect(job.companyName).toBe('Cascade Space');
    expect(job.companyUrl).toBe('https://cascade.space/careers/');
    expect(job.jobUrl).toBe('https://cascade.space/careers/mech-e/');
    expect(job.jobUrlDirect).toBe('https://cascade.space/careers/mech-e/');
    expect(job.id).toBe('cascade_space-senior-mechanical-engineer');
  });

  it('extracts location and employment metadata', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.location?.city).toBe('San Francisco');
    expect(job.location?.state).toBe('CA');
    expect(job.location?.country).toBe(Country.USA);
    expect(job.jobType).toEqual([JobType.FULL_TIME]);
    expect(job.employmentType).toBe('Full time');
    expect(job.isRemote).toBe(false);
    expect(job.workFromHomeType).toBe('On Site');
  });

  it('resolves the apply email from the detail page', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.applyUrl).toBe('mailto:careers@cascade.space');
    expect(job.emails).toEqual(['careers@cascade.space']);
  });

  it('extracts the full role description from the article', async () => {
    mockBothFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.description).toContain('About Cascade Space');
    expect(job.description).toContain('The Role');
    expect(job.description).toContain('Required Qualifications');
  });

  it('filters by searchTerm', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'Mechanical', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
  });

  it('filters by location', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ location: 'San Francisco', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
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

    expect(response.jobs).toHaveLength(1);
  });

  it('applies offset and resultsWanted', async () => {
    mockBothFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ offset: 1, resultsWanted: 1 }),
    );

    expect(response.jobs).toHaveLength(0);
  });

  it('uses the provided companyUrl for the initial request and resolves detail links against it', async () => {
    const customUrl = 'https://example.com/careers/';
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
    expect(response.jobs[0].jobUrl).toBe('https://example.com/careers/mech-e/');
  });

  it('returns an empty list when the careers page has no open roles', async () => {
    getMock.mockResolvedValueOnce({
      data: '<html><head></head><body><h1>Open Positions</h1></body></html>',
    });

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
  });
});
