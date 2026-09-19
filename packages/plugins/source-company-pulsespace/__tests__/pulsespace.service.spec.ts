import * as fs from 'fs';
import * as path from 'path';
import { BrowserPool } from '@ever-jobs/common';
import { Country, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { PulsespaceService } from '../src/pulsespace.service';

const careersFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'careers.html'),
  'utf8',
);
const detailFixture = fs.readFileSync(
  path.join(
    __dirname,
    'fixtures',
    'principal-controls-engineering-architect.html',
  ),
  'utf8',
);

describe('PulsespaceService', () => {
  let service: PulsespaceService;

  beforeEach(() => {
    service = new PulsespaceService();
    jest.spyOn(BrowserPool, 'getPage').mockResolvedValue({
      goto: jest.fn().mockResolvedValue(undefined),
      waitForSelector: jest.fn().mockResolvedValue(undefined),
      content: jest.fn().mockResolvedValue(''),
      close: jest.fn().mockResolvedValue(undefined),
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockPages(): void {
    (service as any).fetchHtml = jest.fn(async (url: string) =>
      url === 'https://pulsespace.com/careers' ? careersFixture : detailFixture,
    );
  }

  it('scrapes the rendered careers list and detail page', async () => {
    mockPages();

    const response = await service.scrape(
      new ScraperInputDto({ resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe(
      'Principal Controls Engineering Architect',
    );
  });

  it('sets Pulse Space metadata and site', async () => {
    mockPages();

    const response = await service.scrape(
      new ScraperInputDto({ resultsWanted: 999 }),
    );

    const job = response.jobs[0];
    expect(job.site).toBe(Site.PULSESPACE);
    expect(job.companyName).toBe('Pulse Space');
    expect(job.companyUrl).toBe('https://pulsespace.com');
    expect(job.jobUrl).toBe(
      'https://pulsespace.com/careers/principal-controls-engineering-architect',
    );
    expect(job.jobUrlDirect).toBe(
      'https://pulsespace.com/careers/principal-controls-engineering-architect',
    );
    expect(job.id).toBe('pulsespace-principal-controls-engineering-architect');
  });

  it('extracts location, employment, and department from the icon badges', async () => {
    mockPages();

    const response = await service.scrape(
      new ScraperInputDto({ resultsWanted: 999 }),
    );

    const job = response.jobs[0];
    expect(job.location?.city).toBe('Seattle');
    expect(job.location?.state).toBe('WA');
    expect(job.location?.country).toBe(Country.USA);
    expect(job.location?.displayLocation()).toBe('Seattle, WA, USA');
    expect(job.jobType).toEqual([JobType.FULL_TIME]);
    expect(job.employmentType).toBe('Full time');
    expect(job.isRemote).toBe(false);
    expect(job.workFromHomeType).toBeUndefined();
    expect(job.department).toBe('Engineering / Controls');
  });

  it('extracts the full role description from h2 sections', async () => {
    mockPages();

    const response = await service.scrape(
      new ScraperInputDto({ resultsWanted: 999 }),
    );

    const job = response.jobs[0];
    expect(job.description).toContain('About this role');
    expect(job.description).toContain('In this role, you will');
    expect(job.description).toContain('What you bring');
    expect(job.description).toContain('What will set you apart');
    expect(job.description).toContain('Pulse develops laser-based systems');
    expect(job.description).toContain('- Instrument the hardware');
  });

  it('filters by searchTerm', async () => {
    mockPages();

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'Controls', resultsWanted: 999 }),
    );
    expect(response.jobs.length).toBeGreaterThan(0);

    const empty = await service.scrape(
      new ScraperInputDto({ searchTerm: 'xyznope', resultsWanted: 999 }),
    );
    expect(empty.jobs).toHaveLength(0);
  });

  it('filters by location', async () => {
    mockPages();

    const response = await service.scrape(
      new ScraperInputDto({ location: 'Seattle', resultsWanted: 999 }),
    );

    expect(response.jobs.length).toBeGreaterThan(0);
  });

  it('filters by isRemote', async () => {
    mockPages();

    const response = await service.scrape(
      new ScraperInputDto({ isRemote: true, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(0);
  });

  it('filters by jobType', async () => {
    mockPages();

    const response = await service.scrape(
      new ScraperInputDto({ jobType: JobType.FULL_TIME, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
  });

  it('returns an empty list when no /careers/<slug> links render', async () => {
    (service as any).fetchHtml = jest.fn(async () =>
      '<html><body><main><h1>Careers</h1></main></body></html>',
    );

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
  });
});
