import { readFileSync } from 'fs';
import { join } from 'path';
import { JobType, ScraperInputDto, Site } from '@ever-jobs/models';

const hiringHtml = readFileSync(join(__dirname, 'fixtures', 'hiring.html'), 'utf8');
const mainJs = readFileSync(join(__dirname, 'fixtures', 'main.js'), 'utf8');
const hiringChunk = readFileSync(join(__dirname, 'fixtures', 'hiring-chunk.js'), 'utf8');
const unrelatedChunk = readFileSync(
  join(__dirname, 'fixtures', 'unrelated-chunk.js'),
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

import { LabsActorService } from '../src/labs-actor.service';

function respondWith(...pages: unknown[]): void {
  getMock.mockReset();
  for (const page of pages) getMock.mockResolvedValueOnce({ data: page });
}

describe('LabsActorService', () => {
  let service: LabsActorService;

  beforeEach(() => {
    getMock.mockReset();
    service = new LabsActorService();
  });

  it('maps every role from the embedded jobs array', async () => {
    respondWith(hiringHtml, mainJs, unrelatedChunk, hiringChunk);
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 9999 }));
    expect(res.jobs).toHaveLength(4);
    expect(res.diagnostics).toBeUndefined();

    const hw = res.jobs.find((j) => j.atsId === 'hardware');
    expect(hw).toBeDefined();
    expect(hw!.id).toBe('labs_actor-hardware');
    expect(hw!.title).toBe('Hardware Engineer');
    expect(hw!.site).toBe(Site.LABS_ACTOR);
    expect(hw!.atsType).toBe('labs_actor');
    expect(hw!.companyName).toBe('Actor');
    expect(hw!.department).toBe('Hardware');
    expect(hw!.location?.city).toBe('Mountain View');
    expect(hw!.location?.state).toBe('CA');
    expect(hw!.employmentType).toBe('Full-time · On-site');
    expect(hw!.jobType).toEqual([JobType.FULL_TIME]);
  });

  it('scans chunk-map chunks until one carries the jobs array', async () => {
    respondWith(hiringHtml, mainJs, unrelatedChunk, hiringChunk);
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(4);
    expect(getMock).toHaveBeenNthCalledWith(1, 'https://labs.actor/hiring');
    expect(getMock).toHaveBeenNthCalledWith(
      2,
      'https://labs.actor/static/js/main.0d3242ba.js',
    );
    expect(getMock).toHaveBeenNthCalledWith(
      3,
      'https://labs.actor/static/js/323.b9794b38.chunk.js',
    );
    expect(getMock).toHaveBeenNthCalledWith(
      4,
      'https://labs.actor/static/js/848.435a36aa.chunk.js',
    );
    expect(getMock).toHaveBeenCalledTimes(4);
  });

  it('composes description from summary, responsibilities, and requirements', async () => {
    respondWith(hiringHtml, mainJs, unrelatedChunk, hiringChunk);
    const res = await service.scrape(new ScraperInputDto({}));
    const ml = res.jobs.find((j) => j.atsId === 'ml')!;
    expect(ml.description).toContain('What you will do:');
    expect(ml.description).toContain('What we are looking for:');
    expect(ml.description).toContain('- ');
  });

  it('routes applyUrl to the team mailbox as a mailto', async () => {
    respondWith(hiringHtml, mainJs, unrelatedChunk, hiringChunk);
    const res = await service.scrape(new ScraperInputDto({}));

    const hw = res.jobs.find((j) => j.atsId === 'hardware')!;
    expect(hw.applyUrl).toBe(
      `mailto:lane@labs.actor?subject=${encodeURIComponent('Hardware Engineer — application')}`,
    );
    const gtm = res.jobs.find((j) => j.atsId === 'gtm')!;
    expect(gtm.applyUrl).toContain('mailto:lane@labs.actor');

    const ml = res.jobs.find((j) => j.atsId === 'ml')!;
    expect(ml.applyUrl).toContain('mailto:shashi@labs.actor');
    const deployed = res.jobs.find((j) => j.atsId === 'deployed')!;
    expect(deployed.applyUrl).toContain('mailto:shashi@labs.actor');
  });

  it('points jobUrl at the careers page (roles expand inline)', async () => {
    respondWith(hiringHtml, mainJs, unrelatedChunk, hiringChunk);
    const res = await service.scrape(new ScraperInputDto({}));
    for (const job of res.jobs) {
      expect(job.jobUrl).toBe('https://labs.actor/hiring');
      expect(job.jobUrlDirect).toBe('https://labs.actor/hiring');
    }
  });

  it('returns an empty diagnostic when no chunk carries the jobs array', async () => {
    respondWith(hiringHtml, mainJs, unrelatedChunk, unrelatedChunk, unrelatedChunk);
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toEqual([]);
    expect(res.diagnostics?.reason).toBe('empty');
  });

  it('returns an empty diagnostic when the shell has no main bundle', async () => {
    respondWith('<html><body>no scripts</body></html>');
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toEqual([]);
    expect(res.diagnostics?.reason).toBe('empty');
  });

  it('returns a classified diagnostic when a fetch throws', async () => {
    getMock.mockRejectedValue(new Error('ECONNRESET'));
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toEqual([]);
    expect(res.diagnostics?.reason).toBeDefined();
  });

  it('honours searchTerm, location, and resultsWanted filters', async () => {
    respondWith(hiringHtml, mainJs, unrelatedChunk, hiringChunk);
    const res = await service.scrape(
      new ScraperInputDto({ searchTerm: 'Machine Learning' }),
    );
    expect(res.jobs).toHaveLength(1);
    expect(res.jobs[0].atsId).toBe('ml');

    respondWith(hiringHtml, mainJs, unrelatedChunk, hiringChunk);
    const loc = await service.scrape(
      new ScraperInputDto({ location: 'mountain view' }),
    );
    expect(loc.jobs).toHaveLength(4);

    respondWith(hiringHtml, mainJs, unrelatedChunk, hiringChunk);
    const limited = await service.scrape(
      new ScraperInputDto({ resultsWanted: 2, offset: 1 }),
    );
    expect(limited.jobs).toHaveLength(2);
    expect(limited.jobs[0].atsId).toBe('hardware');
  });
});
