import 'reflect-metadata';
import { JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { OctbrAiService } from '../src/octbr_ai.service';

const LIST_JOB = (over: object = {}) => ({
  id: 712,
  title: 'Electrical Engineer',
  slug: 'electrical-engineer-d9yjKO',
  url: 'https://starcloud.octbr.ai/jobs/electrical-engineer-d9yjKO',
  location: 'Redmond, WA',
  location_type: 'onsite',
  employment_type: 'full_time',
  employment_type_label: 'Full Time',
  posted_date: '1 month ago',
  ...over,
});

const DETAIL_JOB = {
  id: 712,
  title: 'Electrical Engineer',
  description: '<p>Build satellites.</p>',
  responsibilities: '<ul><li>Design boards.</li></ul>',
  requirements: '<ul><li>BS EE.</li></ul>',
  posted_date: 'August 5, 2026',
};

function dataPage(props: object): string {
  const json = JSON.stringify({ component: 'x', props, url: '/', version: '' });
  return `<html><body><div id="app" data-page="${json.replace(/"/g, '&quot;')}"></div></body></html>`;
}

const LISTING = dataPage({
  jobsByDepartment: [
    { department: 'Electrical Engineering', jobs: [LIST_JOB(), LIST_JOB({ id: 716, title: 'Lead Electrical Engineer', slug: 'lead-electrical-engineer-E9Rmhe', url: 'https://starcloud.octbr.ai/jobs/lead-electrical-engineer-E9Rmhe' })] },
    { department: 'Thermal Engineering', jobs: [LIST_JOB({ id: 711, title: 'Lead Thermal Engineer', slug: 'lead-thermal-engineer-eC7zHN', url: 'https://starcloud.octbr.ai/jobs/lead-thermal-engineer-eC7zHN' })] },
  ],
  organisation: { name: 'Starcloud' },
  totalJobs: 3,
});

const DETAIL = dataPage({ job: DETAIL_JOB });

interface Seams {
  fetchText: (client: unknown, url: string) => Promise<string>;
}

function serviceWith(
  fetchImpl: (url: string) => Promise<string>,
): OctbrAiService {
  const service = new OctbrAiService();
  jest
    .spyOn(service as unknown as Seams, 'fetchText')
    .mockImplementation((_c: unknown, url: string) => fetchImpl(url));
  return service;
}

const okListing = (detailHtml: string = DETAIL) => (url: string) =>
  Promise.resolve(url === 'https://starcloud.octbr.ai/' ? LISTING : detailHtml);

function inputFrom(overrides: Partial<ScraperInputDto> = {}): ScraperInputDto {
  return Object.assign(new ScraperInputDto(), { companySlug: 'starcloud' }, overrides);
}

describe('OctbrAiService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('enumerates every job across departments', async () => {
    const { jobs } = await serviceWith(okListing()).scrape(inputFrom());
    expect(jobs.map((j) => j.title).sort()).toEqual([
      'Electrical Engineer',
      'Lead Electrical Engineer',
      'Lead Thermal Engineer',
    ]);
  });

  it('maps identity, company name, url, and department', async () => {
    const { jobs } = await serviceWith(okListing()).scrape(inputFrom());
    const job = jobs.find((j) => j.title === 'Lead Thermal Engineer')!;
    expect(job.site).toBe(Site.OCTBR_AI);
    expect(job.id).toBe('octbr_ai-starcloud-711');
    expect(job.companyName).toBe('Starcloud');
    expect(job.jobUrl).toBe('https://starcloud.octbr.ai/jobs/lead-thermal-engineer-eC7zHN');
    expect(job.applyUrl).toBe(job.jobUrl);
    expect(job.department).toBe('Thermal Engineering');
    expect(job.atsType).toBe('octbr_ai');
    expect(job.atsId).toBe('711');
  });

  it('parses location and employment type', async () => {
    const { jobs } = await serviceWith(okListing()).scrape(inputFrom());
    const job = jobs[0];
    expect(job.location?.displayLocation()).toContain('Redmond');
    expect(job.isRemote).toBe(false);
    expect(job.jobType).toEqual([JobType.FULL_TIME]);
  });

  it('fills description and absolute posted date from the detail page', async () => {
    const { jobs } = await serviceWith(okListing()).scrape(inputFrom());
    const job = jobs[0];
    expect(job.description).toContain('Build satellites.');
    expect(job.description).toContain('Design boards.');
    expect(job.description).toContain('BS EE.');
    expect(job.datePosted).toEqual(new Date('August 5, 2026'));
  });

  it('keeps jobs whose detail fetch fails', async () => {
    const service = serviceWith(async (url: string) => {
      if (url === 'https://starcloud.octbr.ai/') return LISTING;
      throw new Error('boom');
    });
    const { jobs } = await service.scrape(inputFrom());
    expect(jobs).toHaveLength(3);
    expect(jobs[0].description ?? null).toBeNull();
  });

  it('returns empty when companySlug is missing', async () => {
    const service = serviceWith(okListing());
    const { jobs } = await service.scrape(
      inputFrom({ companySlug: undefined }),
    );
    expect(jobs).toEqual([]);
  });

  it('returns empty when the listing has no data-page', async () => {
    const service = serviceWith(async () => '<html><body>no jobs</body></html>');
    const { jobs } = await service.scrape(inputFrom());
    expect(jobs).toEqual([]);
  });
});
