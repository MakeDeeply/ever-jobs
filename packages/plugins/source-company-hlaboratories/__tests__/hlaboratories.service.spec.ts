import * as fs from 'fs';
import * as path from 'path';
import { createHttpClient } from '@ever-jobs/common';
import { Country, JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { HlaboratoriesService } from '../src/hlaboratories.service';

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(),
  };
});

const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures', 'roles.json'), 'utf8'),
);

describe('HlaboratoriesService', () => {
  let service: HlaboratoriesService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new HlaboratoriesService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({ get: getMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns open roles and skips closed roles', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(2);
    const titles = response.jobs.map((job) => job.title);
    expect(titles).toContain('General Application');
    expect(titles).toContain('Robotics Engineer');
    expect(titles).not.toContain('Closed Role');
  });

  it('sets HLabs metadata and site', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.site).toBe(Site.HLABORATORIES);
      expect(job.companyName).toBe('HLabs');
      expect(job.companyUrl).toBe('https://hlaboratories.com');
      expect(job.jobUrl).toBe('https://hlaboratories.com/jobs');
      expect(job.jobUrlDirect).toBe('https://hlaboratories.com/jobs');
      expect(job.applyUrl).toBe('https://hlaboratories.com/jobs');
      expect(job.jobType).toEqual([JobType.FULL_TIME]);
      expect(job.employmentType).toBe('Full time');
    }
  });

  it('extracts Austin, TX locations', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.location?.city).toBe('Austin');
      expect(job.location?.state).toBe('TX');
      expect(job.location?.country).toBe(Country.USA);
    }
  });

  it('combines description and requirements', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const robotics = response.jobs.find((job) => job.title === 'Robotics Engineer')!;
    expect(robotics.description).toContain('Design and build');
    expect(robotics.description).toContain('## Requirements');
    expect(robotics.description).toContain('Python or C++');
  });

  it('derives isRemote and workFromHomeType from the remote flag', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    for (const job of response.jobs) {
      expect(job.isRemote).toBe(false);
      expect(job.workFromHomeType).toBe('On Site');
    }
  });

  it('uses the id, title, and department fields', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    const robotics = response.jobs.find((job) => job.title === 'Robotics Engineer')!;
    expect(robotics.id).toBe('hlaboratories-1');
    expect(robotics.department).toBe('Engineering');

    const general = response.jobs.find((job) => job.title === 'General Application')!;
    expect(general.id).toBe('hlaboratories-2');
    expect(general.department).toBeNull();
  });

  it('filters by searchTerm', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ searchTerm: 'robotics engineer', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Robotics Engineer');
  });

  it('filters by location', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ location: 'Austin, TX', resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(2);
  });

  it('filters by isRemote', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ isRemote: true, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(0);
  });

  it('filters by jobType', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ jobType: JobType.FULL_TIME, resultsWanted: 999 }),
    );

    expect(response.jobs).toHaveLength(2);
  });

  it('respects offset and resultsWanted', async () => {
    getMock.mockResolvedValueOnce({ data: fixture });

    const response = await service.scrape(
      new ScraperInputDto({ offset: 1, resultsWanted: 1 }),
    );

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].title).toBe('Robotics Engineer');
  });

  it('handles an empty roles array', async () => {
    getMock.mockResolvedValueOnce({ data: [] });

    const response = await service.scrape(new ScraperInputDto({ resultsWanted: 999 }));

    expect(response.jobs).toHaveLength(0);
  });

  it('derives the API URL from input.companyUrl', async () => {
    getMock.mockResolvedValueOnce({ data: [] });

    await service.scrape(
      new ScraperInputDto({
        companyUrl: 'https://example.com/careers',
        resultsWanted: 999,
      }),
    );

    expect(getMock).toHaveBeenCalledWith('https://example.com/api/recruitment/roles?open_only=true');
  });
});
