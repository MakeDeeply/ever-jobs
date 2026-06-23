/**
 * E2E test for the Lever scraper.
 *
 * Tests both public scraping and authenticated API paths.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ScraperInputDto, Site, DescriptionFormat } from '@ever-jobs/models';

const mockGet = jest.fn();
const mockSetHeaders = jest.fn();

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(() => ({
      get: mockGet,
      setHeaders: mockSetHeaders,
    })),
  };
});

import { LeverModule, LeverService } from '@ever-jobs/source-ats-lever';

describe('LeverService (E2E)', () => {
  let service: LeverService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LeverModule],
    }).compile();

    service = module.get<LeverService>(LeverService);
  });

  beforeEach(() => {
    mockGet.mockReset();
    mockSetHeaders.mockReset();
    delete process.env.LEVER_API_KEY;
  });

  it('should return job results via public scraping', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 'a4f0127b-8d20-4c40-856d-a3fb75aed89e',
          text: 'Aeronautical Test Engineer',
          descriptionPlain:
            'Enigma Aerospace is seeking an Aeronautical Test Engineer.',
          lists: [
            {
              text: 'Responsibilities',
              content:
                '<ul><li>Plan and execute performance testing.</li><li>Implement flight test procedures.</li></ul>',
            },
            {
              text: 'Desired Qualifications',
              content:
                '<p>BS/MS or higher in Aerospace Engineering, Controls, or a related field.</p>',
            },
            {
              text: 'Great to have Qualifications and Skills',
              content: '<p>Experience supporting experimental flight test programs.</p>',
            },
          ],
          additionalPlain: 'Enigma is an equal opportunity employer.',
          categories: {
            location: 'San Francisco, CA',
            team: 'Engineering',
            commitment: 'Full-time',
          },
          createdAt: 1719856800000,
          workplaceType: 'onsite',
          hostedUrl:
            'https://jobs.lever.co/crgo/a4f0127b-8d20-4c40-856d-a3fb75aed89e',
          applyUrl:
            'https://jobs.lever.co/crgo/a4f0127b-8d20-4c40-856d-a3fb75aed89e/apply',
        },
      ],
    });

    const input = new ScraperInputDto({
      siteType: [Site.LEVER],
      companySlug: 'crgo',
      resultsWanted: 5,
      descriptionFormat: DescriptionFormat.MARKDOWN,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(response.jobs).toBeDefined();
    expect(Array.isArray(response.jobs)).toBe(true);

    expect(response.jobs).toHaveLength(1);
    const job = response.jobs[0];
    expect(job.title).toBe('Aeronautical Test Engineer');
    expect(job.site).toBe(Site.LEVER);
    expect(job.atsType).toBe('lever');
    expect(job.atsId).toBe('a4f0127b-8d20-4c40-856d-a3fb75aed89e');
    expect(job.description).toContain(
      'Enigma Aerospace is seeking an Aeronautical Test Engineer.',
    );
    expect(job.description).toContain('Responsibilities');
    expect(job.description).toContain('Plan and execute performance testing.');
    expect(job.description).toContain('Desired Qualifications');
    expect(job.description).toContain(
      'BS/MS or higher in Aerospace Engineering',
    );
    expect(job.description).toContain('Great to have Qualifications and Skills');
    expect(job.description).toContain(
      'Experience supporting experimental flight test programs.',
    );
    expect(job.description).toContain(
      'Enigma is an equal opportunity employer.',
    );
    expect(job.description).not.toContain('<li>');
    expect(job.location?.city).toBe('San Francisco');
    expect(job.location?.state).toBe('CA');
    expect(job.team).toBe('Engineering');
    expect(job.employmentType).toBe('Full-time');
    expect(job.applyUrl).toBe(
      'https://jobs.lever.co/crgo/a4f0127b-8d20-4c40-856d-a3fb75aed89e/apply',
    );
    expect(mockGet).toHaveBeenCalledWith(
      'https://api.lever.co/v0/postings/crgo?mode=json',
    );
  });

  it('should fall back to public scraping when API key is invalid', async () => {
    mockGet
      .mockRejectedValueOnce(new Error('401 Unauthorized'))
      .mockResolvedValueOnce({
        data: [
          {
            id: 'fallback-job',
            text: 'Fallback Role',
            descriptionPlain: 'Public board description.',
          },
        ],
      });

    const input = new ScraperInputDto({
      siteType: [Site.LEVER],
      companySlug: 'crgo',
      resultsWanted: 3,
      auth: {
        lever: { apiKey: 'invalid-key' },
      },
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(response.jobs).toBeDefined();
    expect(Array.isArray(response.jobs)).toBe(true);
    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0].id).toBe('lever-fallback-job');
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('should return empty results when no companySlug provided', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.LEVER],
      resultsWanted: 5,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(response.jobs.length).toBe(0);
    expect(mockGet).not.toHaveBeenCalled();
  });
});
