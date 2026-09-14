import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { CompensationInterval, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { AtlasspaceService } from '../src/atlasspace.service';

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(),
  };
});

const careersFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'atlasspace-careers.html'),
  'utf8',
);
const programManagerFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'atlasspace-program-manager.html'),
  'utf8',
);
const directorFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'atlasspace-director.html'),
  'utf8',
);

describe('AtlasspaceService', () => {
  let service: AtlasspaceService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new AtlasspaceService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockResponses() {
    getMock
      .mockResolvedValueOnce({ data: careersFixture })
      .mockResolvedValueOnce({ data: directorFixture })
      .mockResolvedValueOnce({ data: programManagerFixture });
  }

  it('scrapes the Current Openings list and returns both jobs', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(2);
    const titles = response.jobs.map((job) => job.title);
    expect(titles).toContain('Director of Customer Solutions');
    expect(titles).toContain('Program Manager');
  });

  it('sets ATLAS company metadata, job URLs, and apply URL', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const pm = response.jobs.find((job) => job.title === 'Program Manager')!;
    expect(pm.site).toBe(Site.ATLAS);
    expect(pm.companyName).toBe('ATLAS Space Operations');
    expect(pm.companyUrl).toBe('https://atlasspace.com/careers/');
    expect(pm.jobUrl).toBe('https://atlasspace.com/program-manager/');
    expect(pm.jobUrlDirect).toBe('https://atlasspace.com/program-manager/');
    expect(pm.applyUrl).toBe('https://atlasspace.com/apply/');
  });

  it('extracts location city and state for Program Manager', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const pm = response.jobs.find((job) => job.title === 'Program Manager')!;
    expect(pm.location?.city).toBe('Traverse City');
    expect(pm.location?.state).toBe('MI');
    expect(pm.location?.country).toBe('USA');
    expect(pm.location?.displayLocation()).toBe('Traverse City, MI, USA');
    expect(pm.isRemote).toBe(false);
    expect(pm.workFromHomeType).toBe('On Site');
  });

  it('uses the first location option when the Location section lists alternatives', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const director = response.jobs.find((job) => job.title === 'Director of Customer Solutions')!;
    expect(director.location?.city).toBe('Traverse City');
    expect(director.location?.state).toBe('MI');
    expect(director.location?.displayLocation()).toBe('Traverse City, MI, USA');
  });

  it('parses annual salary ranges from the Salary and Salary Range sections', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.compensation?.minAmount).toBe(80000);
      expect(job.compensation?.maxAmount).toBe(110000);
      expect(job.compensation?.currency).toBe('USD');
      expect(job.compensation?.interval).toBe(CompensationInterval.YEARLY);
    }
  });

  it('builds a markdown description from the section headings and content', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const pm = response.jobs.find((job) => job.title === 'Program Manager')!;
    expect(pm.description).toContain('## Job Description');
    expect(pm.description).toContain('## Essential Duties');
    expect(pm.description).toContain('## Required Qualifications');
    expect(pm.description).toContain('## Desired Qualifications');
    expect(pm.description).toContain('## Location');
    expect(pm.description).toContain('## Salary');
    expect(pm.description).toContain('## Benefits');
    expect(pm.description).toContain('## Additional Information');
    expect(pm.description).toContain('ATLAS Space Operations is the leading provider');
  });

  it('defaults to FULL_TIME when the description implies an annual salary', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.jobType).toEqual([JobType.FULL_TIME]);
      expect(job.employmentType).toBe('Full time');
    }
  });

  it('filters by searchTerm', async () => {
    mockResponses();

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'director', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Director of Customer Solutions');
  });

  it('filters by location', async () => {
    mockResponses();

    const response = await service.scrape(
      new ScraperInputDto({ location: 'Traverse City', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(2);
  });

  it('returns no jobs when isRemote is true', async () => {
    mockResponses();

    const response = await service.scrape(
      new ScraperInputDto({ isRemote: true, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(0);
  });

  it('applies offset and resultsWanted', async () => {
    mockResponses();

    const response = await service.scrape(new ScraperInputDto({ offset: 1, resultsWanted: 1 }));

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Program Manager');
  });

  it('uses the provided companyUrl for the initial request', async () => {
    const customUrl = 'https://example.com/careers/';
    getMock
      .mockResolvedValueOnce({ data: careersFixture })
      .mockResolvedValueOnce({ data: directorFixture })
      .mockResolvedValueOnce({ data: programManagerFixture });

    const response = await service.scrape(
      new ScraperInputDto({ companyUrl: customUrl, resultsWanted: 999 }),
    );

    expect(getMock).toHaveBeenNthCalledWith(1, customUrl);
    expect(response.jobs[0].companyUrl).toBe(customUrl);
  });

  it('returns diagnostics when the Current Openings list is missing', async () => {
    getMock.mockResolvedValueOnce({ data: '<html><head></head><body></body></html>' });

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
    expect(response.diagnostics).toBeDefined();
    expect(response.diagnostics!.detail).toMatch(/Current Openings list/);
  });
});
