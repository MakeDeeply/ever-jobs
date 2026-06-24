import 'reflect-metadata';
import { DescriptionFormat, JobType, ScraperInputDto, Site } from '@ever-jobs/models';

const mockGet = jest.fn();
jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(() => ({
      get: mockGet,
      setHeaders: jest.fn(),
    })),
  };
});

import { JsonLdService } from '../src/jsonld.service';

function page(...payloads: unknown[]): string {
  const scripts = payloads
    .map((p) => `<script type="application/ld+json">${JSON.stringify(p)}</script>`)
    .join('\n');
  return `<!doctype html><html><head>${scripts}</head><body>x</body></html>`;
}

const fullJob = {
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: 'Senior Platform Engineer',
  description: '<p>Own the platform. Reach us at jobs@acme.example.</p>',
  datePosted: '2026-06-11',
  employmentType: 'FULL_TIME',
  hiringOrganization: {
    '@type': 'Organization',
    name: 'Acme Corp',
    sameAs: 'https://acme.example',
  },
  url: 'https://acme.example/careers/senior-platform-engineer',
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Austin',
      addressRegion: 'TX',
      addressCountry: 'US',
    },
  },
  baseSalary: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: {
      '@type': 'QuantitativeValue',
      minValue: 150000,
      maxValue: 190000,
      unitText: 'YEAR',
    },
  },
};

function input(overrides: Partial<ScraperInputDto> = {}): ScraperInputDto {
  return new ScraperInputDto({
    companyUrl: 'https://acme.example/careers',
    descriptionFormat: DescriptionFormat.PLAIN,
    ...overrides,
  });
}

describe('JsonLdService', () => {
  let service: JsonLdService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JsonLdService();
  });

  it('returns no jobs when companyUrl is missing', async () => {
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('maps a full JobPosting block into a JobPostDto', async () => {
    mockGet.mockResolvedValue({ data: page(fullJob) });

    const res = await service.scrape(input());
    expect(res.jobs).toHaveLength(1);
    const job = res.jobs[0];
    expect(job.title).toBe('Senior Platform Engineer');
    expect(job.companyName).toBe('Acme Corp');
    expect(job.companyUrl).toBe('https://acme.example');
    expect(job.jobUrl).toBe(
      'https://acme.example/careers/senior-platform-engineer',
    );
    expect(job.location?.city).toBe('Austin');
    expect(job.location?.state).toBe('TX');
    expect(job.datePosted).toBe('2026-06-11');
    expect(job.jobType).toEqual([JobType.FULL_TIME]);
    expect(job.employmentType).toBe('FULL_TIME');
    expect(job.site).toBe(Site.JSONLD);
    expect(job.emails).toContain('jobs@acme.example');
  });

  it('prefers the structured baseSalary range over the text fallback', async () => {
    mockGet.mockResolvedValue({ data: page(fullJob) });

    const res = await service.scrape(input());
    const job = res.jobs[0];
    expect(job.salarySource).toBe('structured');
    expect(job.compensation?.minAmount).toBe(150000);
    expect(job.compensation?.maxAmount).toBe(190000);
    expect(job.compensation?.currency).toBe('USD');
  });

  it('emits one job per posting and honours resultsWanted', async () => {
    mockGet.mockResolvedValue({
      data: page(
        fullJob,
        { ...fullJob, title: 'Role 2', url: 'https://acme.example/2' },
        { ...fullJob, title: 'Role 3', url: 'https://acme.example/3' },
      ),
    });

    const res = await service.scrape(input({ resultsWanted: 2 }));
    expect(res.jobs.map((j) => j.title)).toEqual([
      'Senior Platform Engineer',
      'Role 2',
    ]);
  });

  it('marks a TELECOMMUTE posting as remote', async () => {
    mockGet.mockResolvedValue({
      data: page({
        ...fullJob,
        jobLocation: undefined,
        jobLocationType: 'TELECOMMUTE',
      }),
    });

    const res = await service.scrape(input());
    expect(res.jobs[0].isRemote).toBe(true);
    expect(res.jobs[0].location?.city).toBe('Remote');
  });

  it('returns no jobs when the page has no JobPosting block', async () => {
    mockGet.mockResolvedValue({ data: page({ '@type': 'WebSite' }) });
    const res = await service.scrape(input());
    expect(res.jobs).toHaveLength(0);
  });

  it('returns no jobs and swallows a fetch failure', async () => {
    mockGet.mockRejectedValue(new Error('boom'));
    const res = await service.scrape(input());
    expect(res.jobs).toHaveLength(0);
  });

  it('falls back to the page URL when the posting omits url', async () => {
    mockGet.mockResolvedValue({ data: page({ ...fullJob, url: undefined }) });
    const res = await service.scrape(input());
    expect(res.jobs[0].jobUrl).toBe('https://acme.example/careers');
  });
});
