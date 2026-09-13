import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { Country, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { RenewmfgsolService } from '../src/renewmfgsol.service';

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(),
  };
});

const listingFixture = fs.readFileSync(
  path.join(__dirname, '..', '__fixtures__', 'work-with-us.html'),
  'utf8',
);
const detailFixture = fs.readFileSync(
  path.join(__dirname, '..', '__fixtures__', 'hiring-welders-ga.html'),
  'utf8',
);

describe('RenewmfgsolService', () => {
  let service: RenewmfgsolService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new RenewmfgsolService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockFixtures(): void {
    getMock.mockImplementation((url: string) => {
      if (url === 'https://www.renewmfgsol.com/about/work-with-us') {
        return Promise.resolve({ data: listingFixture });
      }
      if (url.includes('/hiring-welders-ga')) {
        return Promise.resolve({ data: detailFixture });
      }
      return Promise.resolve({ data: '' });
    });
  }

  it('returns the two open roles from the HubSpot careers page', async () => {
    mockFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(2);
    expect(response.jobs[0].title).toBe('Welder');
    expect(response.jobs[1].title).toBe('CNC Machinist');
    expect(response.jobs[0].id).toBe('renewmfgsol-welder');
    expect(response.jobs[1].id).toBe('renewmfgsol-cnc-machinist');
  });

  it('sets ReNEW Manufacturing Solutions metadata and site', async () => {
    mockFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const job = response.jobs[0];
    expect(job.site).toBe(Site.RENEWMFGSOL);
    expect(job.companyName).toBe('ReNEW Manufacturing Solutions');
    expect(job.companyUrl).toBe('https://www.renewmfgsol.com');
  });

  it('extracts location, job type, and on-site metadata', async () => {
    mockFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const welder = response.jobs[0];
    expect(welder.location?.city).toBe('Dalton');
    expect(welder.location?.state).toBe('GA');
    expect(welder.location?.country).toBe(Country.USA);
    expect(welder.location?.displayLocation()).toBe('Dalton, GA, USA');
    expect(welder.jobType).toEqual([JobType.FULL_TIME]);
    expect(welder.employmentType).toBe('Full time');
    expect(welder.isRemote).toBe(false);
    expect(welder.workFromHomeType).toBeUndefined();
  });

  it('fetches the internal detail page for the Welder role and extracts a description', async () => {
    mockFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const welder = response.jobs[0];
    expect(welder.applyUrl).toBe('https://www.renewmfgsol.com/hiring-welders-ga');
    expect(welder.jobUrl).toBe('https://www.renewmfgsol.com/hiring-welders-ga');
    expect(welder.description).toBe(
      'ReNEW Manufacturing Solutions is hiring skilled welders in Dalton, GA. Join our growing manufacturing company!',
    );
    expect(getMock).toHaveBeenCalledWith('https://www.renewmfgsol.com/hiring-welders-ga');
  });

  it('stores the external Adzuna URL as applyUrl without scraping it', async () => {
    mockFixtures();

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const machinist = response.jobs[1];
    expect(machinist.applyUrl).toContain('adzuna.com/details/');
    expect(machinist.applyUrl).toContain('title=CNC%20Machinist');
    expect(machinist.jobUrl).toBe('https://www.renewmfgsol.com/about/work-with-us');
    expect(machinist.description).toBeNull();
    expect(getMock).not.toHaveBeenCalledWith(machinist.applyUrl);
  });

  it('filters by searchTerm', async () => {
    mockFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'Welder', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Welder');
  });

  it('filters by location', async () => {
    mockFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ location: 'TX', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('CNC Machinist');
  });

  it('filters by isRemote', async () => {
    mockFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ isRemote: true, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(0);
  });

  it('applies offset and resultsWanted', async () => {
    mockFixtures();

    const response = await service.scrape(
      new ScraperInputDto({ offset: 1, resultsWanted: 1 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('CNC Machinist');
  });

  it('uses the provided companyUrl for the initial request', async () => {
    const customUrl = 'https://example.com/careers';
    getMock.mockImplementation((url: string) => {
      if (url === customUrl) {
        return Promise.resolve({ data: listingFixture });
      }
      if (url.includes('/hiring-welders-ga')) {
        return Promise.resolve({ data: detailFixture });
      }
      return Promise.resolve({ data: '' });
    });

    const response = await service.scrape(
      new ScraperInputDto({ companyUrl: customUrl, resultsWanted: 999 }),
    );

    expect(getMock).toHaveBeenCalledWith(customUrl);
    expect(response.jobs[0].companyUrl).toBe(customUrl);
    expect(response.jobs[0].jobUrl).toBe(customUrl);
  });

  it('returns an empty list when the careers page has no open roles', async () => {
    getMock.mockResolvedValueOnce({
      data: '<html><head></head><body><h1>Work With Us</h1></body></html>',
    });

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
  });
});
