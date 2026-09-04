import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { SyncereService } from '../src/syncere.service';
import syncereSearchIndexFixture from './fixtures/syncere-search-index.json';

jest.mock('@ever-jobs/common', () => ({
  createHttpClient: jest.fn(),
}));

const startHtmlFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'syncere-start.html'),
  'utf8',
);

describe('SyncereService', () => {
  let service: SyncereService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new SyncereService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockResponses(html: string, json: unknown) {
    getMock
      .mockResolvedValueOnce({ data: html })
      .mockResolvedValueOnce({ data: json });
  }

  it('scrapes the four Syncere job pages with correct titles and URLs', async () => {
    mockResponses(startHtmlFixture, syncereSearchIndexFixture);

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(4);
    const titles = response.jobs.map((job) => job.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        'Robotics Hardware Engineer',
        'Robotics Electrical Engineer',
        'Research Scientist',
        'You Tell Us',
      ]),
    );

    const hard = response.jobs.find((job) => job.title === 'Robotics Hardware Engineer');
    expect(hard).toBeDefined();
    expect(hard!.jobUrl).toBe('https://syncere.com/hard-engineer');
    expect(hard!.id).toBe('syncere-hard-engineer');
    expect(hard!.companyName).toBe('Syncere');
    expect(hard!.site).toBe(Site.SYNCERE);
  });

  it('sets location, workplace type, and remote flags', async () => {
    mockResponses(startHtmlFixture, syncereSearchIndexFixture);

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.location?.city).toBe('Palo Alto');
      expect(job.location?.state).toBe('CA');
      expect(job.location?.displayLocation()).toBe('Palo Alto, CA, USA');
      expect(job.isRemote).toBe(false);
      expect(job.workFromHomeType).toBe('On Site');
    }
  });

  it('extracts apply email as a mailto URL', async () => {
    mockResponses(startHtmlFixture, syncereSearchIndexFixture);

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.applyUrl).toMatch(/^mailto:jobs@syncereai\.com/);
      expect(job.emails).toContain('jobs@syncereai.com');
    }
  });

  it('builds markdown descriptions with section headers and bullet lists', async () => {
    mockResponses(startHtmlFixture, syncereSearchIndexFixture);

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const hard = response.jobs.find((job) => job.title === 'Robotics Hardware Engineer')!;
    expect(hard.description).toContain('## About the Role');
    expect(hard.description).toContain('## What You\'ll Do');
    expect(hard.description).toContain('## What We\'re Looking For');
    expect(hard.description).toContain('## Nice to Have');
    expect(hard.description).toContain('## Details');
    expect(hard.description).toContain('## How to Apply');
    expect(hard.description).toMatch(/- Design and prototype/);
    expect(hard.description).not.toMatch(/CONTACT/);
    expect(hard.description).not.toMatch(/© 2026 Syncere/);
  });

  it('parses job types from the Details section', async () => {
    mockResponses(startHtmlFixture, syncereSearchIndexFixture);

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const hard = response.jobs.find((job) => job.title === 'Robotics Hardware Engineer')!;
    expect(hard.jobType).toEqual(
      expect.arrayContaining([JobType.FULL_TIME, JobType.INTERNSHIP, JobType.CONTRACT]),
    );
    expect(hard.employmentType).toMatch(/Full time/);

    const youTellUs = response.jobs.find((job) => job.title === 'You Tell Us')!;
    expect(youTellUs.jobType).toEqual([]);
  });

  it('filters by searchTerm', async () => {
    mockResponses(startHtmlFixture, syncereSearchIndexFixture);

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'electrical', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Robotics Electrical Engineer');
  });

  it('filters by jobType', async () => {
    mockResponses(startHtmlFixture, syncereSearchIndexFixture);

    const response = await service.scrape(
      new ScraperInputDto({ jobType: JobType.INTERNSHIP, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(3);
    const titles = response.jobs.map((job) => job.title);
    expect(titles).not.toContain('You Tell Us');
  });

  it('returns no jobs when isRemote is true', async () => {
    mockResponses(startHtmlFixture, syncereSearchIndexFixture);

    const response = await service.scrape(
      new ScraperInputDto({ isRemote: true, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(0);
  });

  it('applies offset and resultsWanted', async () => {
    mockResponses(startHtmlFixture, syncereSearchIndexFixture);

    const response = await service.scrape(
      new ScraperInputDto({ offset: 1, resultsWanted: 2 }),
    );

    expect(response.jobs).toHaveLength(2);
  });

  it('returns diagnostics when the Framer search-index meta tag is missing', async () => {
    getMock.mockResolvedValueOnce({ data: '<html><head></head><body></body></html>' });

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
    expect(response.diagnostics).toBeDefined();
    expect(response.diagnostics!.detail).toMatch(/missing.*framer.*search[- ]index/i);
  });

  it('returns an empty array when the search index contains no job pages', async () => {
    mockResponses(startHtmlFixture, {});

    const response = await service.scrape(new ScraperInputDto());

    expect(response.jobs).toHaveLength(0);
  });

  it('uses companyUrl when provided and passes it through to job output', async () => {
    const customUrl = 'https://example.com/careers';
    mockResponses(startHtmlFixture, syncereSearchIndexFixture);

    const response = await service.scrape(
      new ScraperInputDto({ companyUrl: customUrl, resultsWanted: 999 }),
    );

    expect(getMock).toHaveBeenNthCalledWith(1, customUrl);
    expect(response.jobs[0].companyUrl).toBe(customUrl);
  });
});
