import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import {
  DescriptionFormat,
  JobResponseDto,
  ScraperInputDto,
  Site,
} from '@ever-jobs/models';

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

import { RecruiteeModule, RecruiteeService } from '../src';
import { RECRUITEE_OFFICIAL_API_BASE } from '../src/recruitee.constants';
import { RecruiteeOffer } from '../src/recruitee.types';

const STANDARD_SLUG = 'recruitee';
const CUSTOM_HOST = 'careers.morpheus.space';

function buildOffer(overrides: Partial<RecruiteeOffer> = {}): RecruiteeOffer {
  return {
    id: 1,
    title: 'Engineer',
    slug: 'engineer',
    department: 'Engineering',
    location: 'Remote',
    city: null,
    state: null,
    country: null,
    remote: true,
    description: '<p>Build things.</p>',
    created_at: '2026-09-03T10:00:00Z',
    careers_url: '',
    min_hours: null,
    max_hours: null,
    salary_min: null,
    salary_max: null,
    salary_currency: null,
    ...overrides,
  };
}

describe('RecruiteeService — Spec 5100', () => {
  let service: RecruiteeService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RecruiteeModule],
    }).compile();
    service = moduleRef.get(RecruiteeService);
  });

  beforeEach(() => {
    mockGet.mockReset();
    delete process.env.RECRUITEE_API_TOKEN;
  });

  async function scrape(offer: RecruiteeOffer, input: Partial<ScraperInputDto> = {}): Promise<JobResponseDto> {
    mockGet.mockResolvedValueOnce({ data: { offers: [offer] } });
    const dto = new ScraperInputDto({
      siteType: [Site.RECRUITEE],
      companySlug: STANDARD_SLUG,
      resultsWanted: 5,
      descriptionFormat: DescriptionFormat.MARKDOWN,
      ...input,
    });
    return service.scrape(dto);
  }

  it('uses the standard subdomain for a plain slug', async () => {
    await scrape(buildOffer(), { companySlug: STANDARD_SLUG });
    expect(mockGet).toHaveBeenCalledWith(
      `https://${STANDARD_SLUG}.recruitee.com/api/offers`,
    );
  });

  it('uses the custom domain host directly when companySlug contains a dot', async () => {
    await scrape(buildOffer(), { companySlug: CUSTOM_HOST });
    expect(mockGet).toHaveBeenCalledWith(
      `https://${CUSTOM_HOST}/api/offers`,
    );
  });

  it('prefers companyUrl origin over companySlug', async () => {
    await scrape(buildOffer(), {
      companySlug: STANDARD_SLUG,
      companyUrl: `https://${CUSTOM_HOST}/careers/`,
    });
    expect(mockGet).toHaveBeenCalledWith(
      `https://${CUSTOM_HOST}/api/offers`,
    );
  });

  it('uses a slug ending with .recruitee.com as a full host', async () => {
    await scrape(buildOffer(), { companySlug: 'acme.recruitee.com' });
    expect(mockGet).toHaveBeenCalledWith(
      'https://acme.recruitee.com/api/offers',
    );
  });

  it('falls back to the board base URL for jobUrl when careers_url is absent', async () => {
    const response = await scrape(buildOffer({ careers_url: '' }), {
      companySlug: CUSTOM_HOST,
    });
    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].jobUrl).toBe(
      `https://${CUSTOM_HOST}/o/engineer`,
    );
  });

  it('uses offer.careers_url for jobUrl when present', async () => {
    const response = await scrape(
      buildOffer({ careers_url: `https://${CUSTOM_HOST}` }),
      { companySlug: CUSTOM_HOST },
    );
    expect(response.jobs[0].jobUrl).toBe(
      `https://${CUSTOM_HOST}/engineer`,
    );
  });

  it('uses offer.company_name when present, otherwise companySlug', async () => {
    const withName = await scrape(
      buildOffer({ company_name: 'Morpheus Space' }),
      { companySlug: CUSTOM_HOST },
    );
    expect(withName.jobs[0].companyName).toBe('Morpheus Space');

    const withoutName = await scrape(buildOffer(), { companySlug: CUSTOM_HOST });
    expect(withoutName.jobs[0].companyName).toBe(CUSTOM_HOST);
  });

  it('calls the official API for standard slug with an auth token', async () => {
    mockGet.mockResolvedValueOnce({ data: { offers: [] } });
    const dto = new ScraperInputDto({
      siteType: [Site.RECRUITEE],
      companySlug: STANDARD_SLUG,
      resultsWanted: 5,
      auth: { recruitee: { apiToken: 'token-123' } } as any,
    });
    await service.scrape(dto);
    expect(mockGet).toHaveBeenCalledWith(
      `${RECRUITEE_OFFICIAL_API_BASE}/${STANDARD_SLUG}/offers?scope=published`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
      }),
    );
  });

  it('skips the official API and uses public scraping for a custom-domain host even with a token', async () => {
    const response = await scrape(buildOffer(), {
      companySlug: CUSTOM_HOST,
      auth: { recruitee: { apiToken: 'token-123' } } as any,
    });
    expect(mockGet).toHaveBeenCalledWith(
      `https://${CUSTOM_HOST}/api/offers`,
    );
    expect(response.jobs).toHaveLength(1);
  });

  it('falls back to public scraping when the authenticated API fails', async () => {
    mockGet
      .mockRejectedValueOnce(new Error('unauthorized'))
      .mockResolvedValueOnce({ data: { offers: [buildOffer()] } });
    const dto = new ScraperInputDto({
      siteType: [Site.RECRUITEE],
      companySlug: STANDARD_SLUG,
      resultsWanted: 5,
      auth: { recruitee: { apiToken: 'token-123' } } as any,
    });
    const response = await service.scrape(dto);
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      `${RECRUITEE_OFFICIAL_API_BASE}/${STANDARD_SLUG}/offers?scope=published`,
      expect.any(Object),
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      `https://${STANDARD_SLUG}.recruitee.com/api/offers`,
    );
    expect(response.jobs).toHaveLength(1);
  });

  it('returns bad_input when companySlug is empty', async () => {
    const response = await service.scrape(
      new ScraperInputDto({
        siteType: [Site.RECRUITEE],
        companySlug: '',
        resultsWanted: 5,
      }),
    );
    expect(response.jobs).toHaveLength(0);
    expect(response.diagnostics?.reason).toBe('bad_input');
  });

  it('returns bad_input when companyUrl is invalid', async () => {
    const response = await service.scrape(
      new ScraperInputDto({
        siteType: [Site.RECRUITEE],
        companySlug: STANDARD_SLUG,
        companyUrl: 'not a valid url',
        resultsWanted: 5,
      }),
    );
    expect(response.jobs).toHaveLength(0);
    expect(response.diagnostics?.reason).toBe('bad_input');
  });

  it('respects resultsWanted', async () => {
    mockGet.mockResolvedValueOnce({
      data: { offers: Array.from({ length: 10 }, (_, i) => buildOffer({ id: i + 1 })) },
    });
    const response = await service.scrape(
      new ScraperInputDto({
        siteType: [Site.RECRUITEE],
        companySlug: STANDARD_SLUG,
        resultsWanted: 3,
      }),
    );
    expect(response.jobs).toHaveLength(3);
  });
});
