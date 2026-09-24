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

import { AmpflameService } from '../src/ampflame.service';

function respondWith(payload: unknown): void {
  getMock.mockResolvedValue({ data: payload });
}

describe('AmpflameService', () => {
  let service: AmpflameService;

  beforeEach(() => {
    getMock.mockReset();
    service = new AmpflameService();
  });

  it('maps all 3 rows from the careers table', async () => {
    respondWith(careersHtml);
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 9999 }));
    expect(res.jobs).toHaveLength(3);
    expect(res.diagnostics).toBeUndefined();

    const sales = res.jobs.find((j) => j.title === 'Sales Associate');
    expect(sales).toBeDefined();
    expect(sales!.id).toBe('ampflame-sales-associate-milwaukee-wi');
    expect(sales!.atsId).toBe('sales-associate-milwaukee-wi');
    expect(sales!.site).toBe(Site.AMPFLAME);
    expect(sales!.atsType).toBe('ampflame');
    expect(sales!.companyName).toBe('Accurate Metals');
    expect(sales!.department).toBe('Sales');
    expect(sales!.location?.city).toBe('Milwaukee');
    expect(sales!.location?.state).toBe('WI');
  });

  it('deduplicates identical titles via the location slug', async () => {
    respondWith(careersHtml);
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 9999 }));
    const grinders = res.jobs.filter((j) => j.title === 'Blanchard Grinder Operator');
    expect(grinders).toHaveLength(2);
    const ids = grinders.map((j) => j.id).sort();
    expect(ids).toEqual([
      'ampflame-blanchard-grinder-operator-menomonee-falls-wi',
      'ampflame-blanchard-grinder-operator-rockford-il',
    ]);
    expect(grinders.map((j) => j.location?.state).sort()).toEqual(['IL', 'WI']);
    expect(grinders.every((j) => j.department === 'Manufacturing')).toBe(true);
  });

  it('points jobUrl at the careers page and applyUrl at the contact form', async () => {
    respondWith(careersHtml);
    const res = await service.scrape(new ScraperInputDto({}));
    for (const job of res.jobs) {
      expect(job.jobUrl).toBe('https://ampflame.com/about/');
      expect(job.jobUrlDirect).toBe('https://ampflame.com/about/');
      expect(job.applyUrl).toBe('https://ampflame.com/accurate-metals-contact-us/');
    }
  });

  it('honors an alternate companyUrl as the board page', async () => {
    respondWith(careersHtml);
    const res = await service.scrape(
      new ScraperInputDto({ companyUrl: 'https://ampflame.com/about' }),
    );
    expect(getMock).toHaveBeenCalledWith('https://ampflame.com/about');
    expect(res.jobs[0].jobUrl).toBe('https://ampflame.com/about');
  });

  it('returns an empty diagnostic when no table rows are present', async () => {
    respondWith('<html><body><div role="table" aria-label="Open positions"></div></body></html>');
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics?.reason).toBe('empty');
  });

  it('returns an empty diagnostic when the table is missing entirely', async () => {
    respondWith('<html><body><main>No careers here</main></body></html>');
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics?.reason).toBe('empty');
  });

  it('skips a header row that carries no Position cell', async () => {
    const html =
      '<div role="table" aria-label="Open positions">' +
      '<div role="row"><span role="columnheader">Department</span><span role="columnheader">Position</span></div>' +
      '<div role="row"><span role="cell" data-label="Department">Ops</span>' +
      '<span role="cell" data-label="Location">Green Bay, WI</span>' +
      '<span role="cell" data-label="Position">Welder</span>' +
      '<span role="cell" data-label="Apply"><a href="/apply/">Apply</a></span></div>' +
      '</div>';
    respondWith(html);
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(1);
    expect(res.jobs[0].title).toBe('Welder');
    expect(res.jobs[0].applyUrl).toBe('https://ampflame.com/apply/');
  });

  it('returns diagnostics when the fetch fails', async () => {
    getMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics).toBeDefined();
  });

  it('honors resultsWanted, searchTerm, and location', async () => {
    respondWith(careersHtml);
    const paged = await service.scrape(new ScraperInputDto({ resultsWanted: 1 }));
    expect(paged.jobs).toHaveLength(1);

    const searched = await service.scrape(
      new ScraperInputDto({ resultsWanted: 9999, searchTerm: 'sales' }),
    );
    expect(searched.jobs).toHaveLength(1);
    expect(searched.jobs[0].title).toBe('Sales Associate');

    const located = await service.scrape(
      new ScraperInputDto({ resultsWanted: 9999, location: 'Rockford' }),
    );
    expect(located.jobs).toHaveLength(1);
    expect(located.jobs[0].location?.state).toBe('IL');
  });
});
