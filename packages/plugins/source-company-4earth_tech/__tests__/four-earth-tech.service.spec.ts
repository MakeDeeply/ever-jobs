import { readFileSync } from 'fs';
import { join } from 'path';
import { JobType, ScraperInputDto, Site } from '@ever-jobs/models';

const careersHtml = readFileSync(
  join(__dirname, 'fixtures', 'careers.html'),
  'utf8',
);
const careersChunk = readFileSync(
  join(__dirname, 'fixtures', 'careers-chunk.js'),
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

import { FourEarthTechService } from '../src/four-earth-tech.service';

function respondWith(shell: unknown, chunk?: unknown): void {
  getMock.mockReset();
  getMock.mockResolvedValueOnce({ data: shell });
  if (chunk !== undefined) getMock.mockResolvedValueOnce({ data: chunk });
}

describe('FourEarthTechService', () => {
  let service: FourEarthTechService;

  beforeEach(() => {
    getMock.mockReset();
    service = new FourEarthTechService();
  });

  it('maps both roles from the embedded jobs array', async () => {
    respondWith(careersHtml, careersChunk);
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 9999 }));
    expect(res.jobs).toHaveLength(2);
    expect(res.diagnostics).toBeUndefined();

    const ee = res.jobs.find((j) => j.atsId === 'electrical-systems-engineer');
    expect(ee).toBeDefined();
    expect(ee!.id).toBe('4earth_tech-electrical-systems-engineer');
    expect(ee!.title).toBe('Electrical Systems Engineer');
    expect(ee!.site).toBe(Site.FOUR_EARTH_TECH);
    expect(ee!.atsType).toBe('4earth_tech');
    expect(ee!.companyName).toBe('4Earth');
    expect(ee!.location?.city).toBe('Marietta');
    expect(ee!.location?.state).toBe('GA');
    expect(ee!.employmentType).toBe('Full-time (Onsite)');
    expect(ee!.jobType).toEqual([JobType.FULL_TIME]);

    const me = res.jobs.find((j) => j.atsId === 'mechanical-systems-engineer');
    expect(me).toBeDefined();
    expect(me!.title).toBe('Mechanical Systems Engineer');
  });

  it('fetches the shell then the Careers chunk it references', async () => {
    respondWith(careersHtml, careersChunk);
    await service.scrape(new ScraperInputDto({}));
    expect(getMock).toHaveBeenNthCalledWith(1, 'https://www.4earth.tech/careers');
    expect(getMock).toHaveBeenNthCalledWith(
      2,
      'https://www.4earth.tech/assets/Careers-2dff7c22.js',
    );
  });

  it('composes a multi-part description from the entry fields', async () => {
    respondWith(careersHtml, careersChunk);
    const res = await service.scrape(new ScraperInputDto({}));
    const ee = res.jobs.find((j) => j.atsId === 'electrical-systems-engineer');
    const desc = ee!.description ?? '';
    expect(desc).toContain('resource recovery technology');
    expect(desc).toContain('electron path');
    expect(desc).toContain('What You Will Build:');
    expect(desc).toContain('- The Nervous System:');
    expect(desc).toContain('- PLC Programming');
    expect(desc).toContain('re-engineering the water cycle');
    expect(desc.length).toBeGreaterThan(2000);
  });

  it('points jobUrl and applyUrl at the careers page', async () => {
    respondWith(careersHtml, careersChunk);
    const res = await service.scrape(new ScraperInputDto({}));
    for (const job of res.jobs) {
      expect(job.jobUrl).toBe('https://www.4earth.tech/careers');
      expect(job.jobUrlDirect).toBe('https://www.4earth.tech/careers');
      expect(job.applyUrl).toBe('https://www.4earth.tech/careers');
    }
  });

  it('returns an empty diagnostic when the shell has no chunk link', async () => {
    respondWith('<html><body><main>no assets</main></body></html>');
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics?.reason).toBe('empty');
    expect(getMock).toHaveBeenCalledTimes(1);
  });

  it('returns an empty diagnostic when the chunk has no jobs array', async () => {
    respondWith(careersHtml, 'const x=1;export{x};');
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics?.reason).toBe('empty');
  });

  it('returns diagnostics when the fetch fails', async () => {
    getMock.mockReset();
    getMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics).toBeDefined();
  });

  it('honors resultsWanted, searchTerm, and location', async () => {
    respondWith(careersHtml, careersChunk);
    const paged = await service.scrape(new ScraperInputDto({ resultsWanted: 1 }));
    expect(paged.jobs).toHaveLength(1);

    respondWith(careersHtml, careersChunk);
    const searched = await service.scrape(
      new ScraperInputDto({ resultsWanted: 9999, searchTerm: 'mechanical' }),
    );
    expect(searched.jobs).toHaveLength(1);
    expect(searched.jobs[0].atsId).toBe('mechanical-systems-engineer');

    respondWith(careersHtml, careersChunk);
    const located = await service.scrape(
      new ScraperInputDto({ resultsWanted: 9999, location: 'Marietta' }),
    );
    expect(located.jobs).toHaveLength(2);
  });
});
