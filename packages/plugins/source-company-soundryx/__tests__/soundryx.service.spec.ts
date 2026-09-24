import { readFileSync } from 'fs';
import { join } from 'path';
import { ScraperInputDto, Site } from '@ever-jobs/models';

const careersHtml = readFileSync(join(__dirname, 'fixtures', 'careers.html'), 'utf8');
const jobPages: Record<string, string> = {
  'https://soundryx.com/careers/00001-founding-electrical-engineer/': readFileSync(
    join(__dirname, 'fixtures', 'job-electrical.html'),
    'utf8',
  ),
  'https://soundryx.com/careers/00002-founding-audio-ml-engineer/': readFileSync(
    join(__dirname, 'fixtures', 'job-ml.html'),
    'utf8',
  ),
  'https://soundryx.com/careers/00003-founding-fde-spanish/': readFileSync(
    join(__dirname, 'fixtures', 'job-fde.html'),
    'utf8',
  ),
};

const getMock = jest.fn();
jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(() => ({ get: getMock })),
  };
});

import { SoundryxService } from '../src/soundryx.service';

function respondWithPages(pages: Record<string, string>): void {
  getMock.mockReset();
  getMock.mockImplementation((url: string) => {
    const data = pages[url];
    if (data === undefined) return Promise.reject(new Error(`unexpected fetch: ${url}`));
    return Promise.resolve({ data });
  });
}

function live(): void {
  respondWithPages({ 'https://soundryx.com/careers/': careersHtml, ...jobPages });
}

describe('SoundryxService', () => {
  let service: SoundryxService;

  beforeEach(() => {
    getMock.mockReset();
    service = new SoundryxService();
  });

  it('maps every role tile to its detail page', async () => {
    live();
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 9999 }));
    expect(res.jobs).toHaveLength(3);
    expect(res.diagnostics).toBeUndefined();

    const ee = res.jobs.find((j) => j.atsId === '00001-founding-electrical-engineer');
    expect(ee).toBeDefined();
    expect(ee!.id).toBe('soundryx-00001-founding-electrical-engineer');
    expect(ee!.title).toBe('Founding Electrical Engineer');
    expect(ee!.site).toBe(Site.SOUNDRYX);
    expect(ee!.atsType).toBe('soundryx');
    expect(ee!.companyName).toBe('Soundryx');
    expect(ee!.location?.city).toBe('Los Angeles');
    expect(ee!.location?.state).toBe('CA');
    expect(ee!.workFromHomeType).toBe('On Site');
    expect(ee!.jobUrl).toBe('https://soundryx.com/careers/00001-founding-electrical-engineer/');
    expect(ee!.jobUrlDirect).toBe(ee!.jobUrl);
  });

  it('fetches the index then each tile detail page', async () => {
    live();
    await service.scrape(new ScraperInputDto({}));
    expect(getMock).toHaveBeenNthCalledWith(1, 'https://soundryx.com/careers/');
    const urls = getMock.mock.calls.map((c) => c[0]);
    expect(urls).toContain('https://soundryx.com/careers/00001-founding-electrical-engineer/');
    expect(urls).toContain('https://soundryx.com/careers/00002-founding-audio-ml-engineer/');
    expect(urls).toContain('https://soundryx.com/careers/00003-founding-fde-spanish/');
    expect(getMock).toHaveBeenCalledTimes(4);
  });

  it('composes description from the detail body without footnotes', async () => {
    live();
    const res = await service.scrape(new ScraperInputDto({}));
    const ee = res.jobs.find((j) => j.atsId === '00001-founding-electrical-engineer')!;
    expect(ee.description).toContain('What You');
    expect(ee.description).toContain('PCB');
    expect(ee.description).toContain('Export Control');
    expect(ee.description).not.toContain('22 C.F.R.');
    expect(ee.description!.length).toBeGreaterThan(1000);
  });

  it('decodes the Cloudflare-protected apply mailto', async () => {
    live();
    const res = await service.scrape(new ScraperInputDto({}));
    for (const job of res.jobs) {
      expect(job.applyUrl).toBe('mailto:careers@soundryx.com');
    }
  });

  it('parses the Compensation section into compensation', async () => {
    live();
    const res = await service.scrape(new ScraperInputDto({}));
    const ee = res.jobs.find((j) => j.atsId === '00001-founding-electrical-engineer')!;
    expect(ee.compensation).toBeDefined();
    expect(ee.compensation?.minAmount).toBe(130000);
    expect(ee.compensation?.maxAmount).toBe(180000);
    expect(ee.compensation?.currency).toBe('USD');
  });

  it('returns an empty diagnostic when the index has no tiles', async () => {
    respondWithPages({ 'https://soundryx.com/careers/': '<html><body>empty</body></html>' });
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toEqual([]);
    expect(res.diagnostics?.reason).toBe('empty');
  });

  it('returns a classified diagnostic when the index fetch throws', async () => {
    getMock.mockRejectedValue(new Error('ECONNRESET'));
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toEqual([]);
    expect(res.diagnostics?.reason).toBeDefined();
  });

  it('honours searchTerm, location, and resultsWanted filters', async () => {
    live();
    const res = await service.scrape(new ScraperInputDto({ searchTerm: 'Audio ML' }));
    expect(res.jobs).toHaveLength(1);
    expect(res.jobs[0].atsId).toBe('00002-founding-audio-ml-engineer');

    live();
    const loc = await service.scrape(new ScraperInputDto({ location: 'los angeles' }));
    expect(loc.jobs).toHaveLength(3);

    live();
    const limited = await service.scrape(
      new ScraperInputDto({ resultsWanted: 1, offset: 1 }),
    );
    expect(limited.jobs).toHaveLength(1);
    expect(limited.jobs[0].atsId).toBe('00002-founding-audio-ml-engineer');
  });
});
