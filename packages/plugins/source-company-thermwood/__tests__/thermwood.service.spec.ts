import { readFileSync } from 'fs';
import { join } from 'path';
import { ScraperInputDto, Site } from '@ever-jobs/models';

const careersHtml = readFileSync(
  join(__dirname, 'fixtures', 'careers.html'),
  'utf8',
);

const getMock = jest.fn();
jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(() => ({ get: getMock })),
  };
});

import { ThermwoodService } from '../src/thermwood.service';

function respondWith(payload: unknown): void {
  getMock.mockResolvedValue({ data: payload });
}

describe('ThermwoodService', () => {
  let service: ThermwoodService;

  beforeEach(() => {
    getMock.mockReset();
    service = new ThermwoodService();
  });

  it('maps only the live cards (commented-out cards never emit)', async () => {
    respondWith(careersHtml);
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 99 }));
    expect(res.jobs).toHaveLength(2);
    expect(res.diagnostics).toBeUndefined();

    const titles = res.jobs.map((j) => j.title);
    expect(titles).toContain('Manufacturing Technician');
    expect(titles).toContain('General Application - Production');
    // retired cards live in HTML comments — never parsed
    expect(titles).not.toContain('Paint/Prep');
    expect(titles).not.toContain('Machine Alignment Technician');

    const mfg = res.jobs.find((j) => j.title === 'Manufacturing Technician')!;
    expect(mfg.id).toBe('thermwood-manufacturing-technician');
    expect(mfg.atsId).toBe('manufacturing-technician');
    expect(mfg.site).toBe(Site.THERMWOOD);
    expect(mfg.atsType).toBe('thermwood');
    expect(mfg.companyName).toBe('Thermwood');
    expect(mfg.location?.city).toBe('Dale');
    expect(mfg.location?.state).toBe('IN');
    expect(mfg.jobType).toEqual(['fulltime']);
    expect(mfg.employmentType).toBe('Full-time');
  });

  it('parses datePosted from "Posted: MM-DD-YYYY" and nulls "Ongoing"', async () => {
    respondWith(careersHtml);
    const res = await service.scrape(new ScraperInputDto({}));
    const mfg = res.jobs.find((j) => j.title === 'Manufacturing Technician')!;
    expect(new Date(mfg.datePosted as Date).toISOString()).toContain(
      '2026-09-23',
    );
    const general = res.jobs.find(
      (j) => j.title === 'General Application - Production',
    )!;
    expect(general.datePosted).toBeUndefined();
  });

  it('composes description from card details (headings + bullets)', async () => {
    respondWith(careersHtml);
    const res = await service.scrape(new ScraperInputDto({}));
    const mfg = res.jobs.find((j) => j.title === 'Manufacturing Technician')!;
    expect(mfg.description).toBeDefined();
    expect(mfg.description).toContain('Qualifications');
    expect(mfg.description).toContain('Blueprint reading');
    expect(mfg.description).toContain('What We Offer');
  });

  it('anchors applyUrl at #application-form and extracts the resume mailto', async () => {
    respondWith(careersHtml);
    const res = await service.scrape(new ScraperInputDto({}));
    const mfg = res.jobs.find((j) => j.title === 'Manufacturing Technician')!;
    expect(mfg.jobUrl).toBe(
      'https://www.thermwood.com/employment-opportunities.htm',
    );
    expect(mfg.applyUrl).toBe(
      'https://www.thermwood.com/employment-opportunities.htm#application-form',
    );
    expect(mfg.emails).toContain('semiller@thermwood.com');
  });

  it('honors a companyUrl override', async () => {
    respondWith(careersHtml);
    const res = await service.scrape(
      new ScraperInputDto({
        companyUrl: 'https://www.thermwood.com/custom.htm',
      }),
    );
    expect(res.jobs[0].jobUrl).toBe('https://www.thermwood.com/custom.htm');
    expect(res.jobs[0].applyUrl).toBe(
      'https://www.thermwood.com/custom.htm#application-form',
    );
  });

  it('returns an empty diagnostic when no cards are found', async () => {
    respondWith('<html><body><p>No jobs</p></body></html>');
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics?.reason).toBe('empty');
  });

  it('returns diagnostics when the fetch fails', async () => {
    getMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics).toBeDefined();
  });

  it('honors searchTerm, location, resultsWanted, and offset', async () => {
    respondWith(careersHtml);
    const search = await service.scrape(
      new ScraperInputDto({ searchTerm: 'manufacturing' }),
    );
    expect(search.jobs).toHaveLength(1);
    expect(search.jobs[0].title).toBe('Manufacturing Technician');

    const loc = await service.scrape(new ScraperInputDto({ location: 'dale' }));
    expect(loc.jobs).toHaveLength(2);

    const paged = await service.scrape(
      new ScraperInputDto({ resultsWanted: 1, offset: 1 }),
    );
    expect(paged.jobs).toHaveLength(1);
  });
});
