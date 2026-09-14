import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import { BrowserPool } from '@ever-jobs/common';
import { Country, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { ChangroboticsAiService } from '../src/changrobotics_ai.service';

const fixturePath = path.join(__dirname, 'fixtures', 'careers.html');
const careersHtml = fs.readFileSync(fixturePath, 'utf8');

describe('ChangroboticsAiService', () => {
  let service: ChangroboticsAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChangroboticsAiService],
    }).compile();
    service = module.get<ChangroboticsAiService>(ChangroboticsAiService);

    jest.spyOn(BrowserPool, 'getPage').mockResolvedValue({
      goto: jest.fn().mockResolvedValue(undefined),
      content: jest.fn().mockResolvedValue(''),
      close: jest.fn().mockResolvedValue(undefined),
    } as any);

    (service as any).fetchHtml = jest.fn().mockResolvedValue(careersHtml);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns two jobs from the Wix accordion fixture', async () => {
    const response = await service.scrape(new ScraperInputDto());
    expect(response.jobs).toHaveLength(2);
    expect(response.jobs[0].title).toBe('Factory Automation Expert');
    expect(response.jobs[1].title).toBe('Growth Marketing Specialist');
  });

  it('stamps job metadata with the Chang Robotics site and company', async () => {
    const response = await service.scrape(new ScraperInputDto());
    const job = response.jobs[0];
    expect(job.site).toBe(Site.CHANGROBOTICS_AI);
    expect(job.companyName).toBe('Chang Robotics');
    expect(job.jobUrl).toBe('https://www.changrobotics.ai/careers');
    expect(job.companyUrl).toBe('https://www.changrobotics.ai/careers');
  });

  it('extracts the Microsoft Form apply URL for Factory Automation Expert', async () => {
    const response = await service.scrape(new ScraperInputDto());
    const job = response.jobs.find((j) => j.title === 'Factory Automation Expert');
    expect(job).toBeDefined();
    expect(job!.applyUrl).toBe('https://forms.cloud.microsoft/r/81ezb9K9b4');
    expect(job!.location).toBeNull();
  });

  it('extracts the Indeed apply URL and Jacksonville, FL location for Growth Marketing Specialist', async () => {
    const response = await service.scrape(new ScraperInputDto());
    const job = response.jobs.find((j) => j.title === 'Growth Marketing Specialist');
    expect(job).toBeDefined();
    expect(job!.applyUrl).toBe(
      'https://www.indeed.com/viewjob?jk=9d165af511de21b5&from=shareddesktop_copy',
    );
    expect(job!.location).toMatchObject({
      city: 'Jacksonville',
      state: 'FL',
      country: Country.USA,
    });
  });

  it('converts the rich-text description to markdown', async () => {
    const response = await service.scrape(new ScraperInputDto());
    const marketing = response.jobs.find((j) => j.title === 'Growth Marketing Specialist');
    expect(marketing!.description).toContain('LinkedIn outreach');
    expect(marketing!.description).toContain('Must live in Jacksonville, FL');
    const engineering = response.jobs.find((j) => j.title === 'Factory Automation Expert');
    expect(engineering!.description).toContain('Factory 5.0');
  });

  it('defaults job type to full-time', async () => {
    const response = await service.scrape(new ScraperInputDto());
    for (const job of response.jobs) {
      expect(job.jobType).toContain(JobType.FULL_TIME);
      expect(job.employmentType).toBe('Full time');
    }
  });

  it('filters by search term in title or description', async () => {
    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'Jacksonville' }),
    );
    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Growth Marketing Specialist');
  });

  it('filters by location', async () => {
    const response = await service.scrape(
      new ScraperInputDto({ location: 'FL' }),
    );
    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Growth Marketing Specialist');
  });

  it('filters by isRemote when true', async () => {
    const response = await service.scrape(
      new ScraperInputDto({ isRemote: true }),
    );
    expect(response.jobs).toHaveLength(0);
  });

  it('paginates results by offset and resultsWanted', async () => {
    const response = await service.scrape(
      new ScraperInputDto({ offset: 1, resultsWanted: 1 }),
    );
    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Growth Marketing Specialist');
  });

  it('returns an empty list when the accordion is absent', async () => {
    (service as any).fetchHtml = jest.fn().mockResolvedValue('<html><body></body></html>');
    const response = await service.scrape(new ScraperInputDto());
    expect(response.jobs).toHaveLength(0);
  });

  it('deduplicates jobs with the same title and apply URL', async () => {
    const duplicated = careersHtml.replace(/<li class="AccordionContainer/, '<li class="AccordionContainer');
    // Same fixture already has unique titles; test that identical repeated items collapse.
    const repeated = `${careersHtml}\n${careersHtml}`;
    (service as any).fetchHtml = jest.fn().mockResolvedValue(repeated);
    const response = await service.scrape(new ScraperInputDto());
    expect(response.jobs).toHaveLength(2);
  });
});
