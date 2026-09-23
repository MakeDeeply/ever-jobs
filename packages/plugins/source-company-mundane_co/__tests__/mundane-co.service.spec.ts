import { readFileSync } from 'fs';
import { join } from 'path';
import { JobType, ScraperInputDto, Site } from '@ever-jobs/models';

const bundleJs = readFileSync(join(__dirname, 'fixtures', 'bundle-slice.js'), 'utf8');
const shellHtml =
  '<!doctype html><html><head><script type="module" src="/assets/index-TEST123.js"></script></head><body><div id="root"></div></body></html>';

const getMock = jest.fn();
const gotoMock = jest.fn();
const evaluateMock = jest.fn();
const getPageMock = jest.fn();
const closeMock = jest.fn();
jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(() => ({ get: getMock })),
    BrowserPool: {
      getPage: (...args: unknown[]) => getPageMock(...args),
      close: (...args: unknown[]) => closeMock(...args),
    },
  };
});

import { MundaneCoService } from '../src/mundane-co.service';

function respondOk(bundle: string = bundleJs): void {
  getMock.mockImplementation((url: string) => {
    if (url.includes('/assets/')) return Promise.resolve({ data: bundle });
    return Promise.resolve({ data: shellHtml });
  });
}

describe('MundaneCoService', () => {
  let service: MundaneCoService;

  beforeEach(() => {
    getMock.mockReset();
    gotoMock.mockReset().mockResolvedValue(undefined);
    evaluateMock.mockReset().mockResolvedValue('Rendered Airtable job description.');
    getPageMock.mockReset().mockResolvedValue({ goto: gotoMock, evaluate: evaluateMock });
    closeMock.mockReset().mockResolvedValue(undefined);
    service = new MundaneCoService();
  });

  it('maps all 10 embedded jobs and skips non-apply decoy entries', async () => {
    respondOk();
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 9999 }));
    expect(res.jobs).toHaveLength(10);
    expect(res.diagnostics).toBeUndefined();
    expect(res.jobs.every((j) => j.site === Site.MUNDANE_CO)).toBe(true);
    expect(res.jobs.every((j) => j.atsType === 'mundane_co')).toBe(true);
    expect(res.jobs.every((j) => j.companyName === 'Mundane')).toBe(true);
    expect(res.jobs.some((j) => j.jobUrl?.includes('example.com'))).toBe(false);
  });

  it('derives ids from LinkedIn job id, Airtable form id, or title slug', async () => {
    respondOk();
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 9999 }));
    const linkedin = res.jobs.find((j) => j.title === 'Robotics Product Manager');
    expect(linkedin!.id).toBe('mundane_co-4389747796');
    expect(linkedin!.jobUrl).toBe('https://www.linkedin.com/jobs/view/4389747796/');

    const airtable = res.jobs.find((j) => j.title === 'VP, Teleportation');
    expect(airtable!.id).toBe('mundane_co-pagSC8TmTu8RYMRfN');
    expect(airtable!.jobUrl).toBe('https://airtable.com/appJtaRURYFPJILxd/pagSC8TmTu8RYMRfN/form');
  });

  it('maps category to department and detects internship jobType', async () => {
    respondOk();
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 9999 }));
    const research = res.jobs.filter((j) => j.department === 'Research');
    const dev = res.jobs.filter((j) => j.department === 'Development');
    const ops = res.jobs.filter((j) => j.department === 'Operations');
    expect(research).toHaveLength(4);
    expect(dev).toHaveLength(5);
    expect(ops).toHaveLength(1);

    const intern = res.jobs.find((j) => j.title === 'Mechatronics Engineer Intern');
    expect(intern!.jobType).toEqual([JobType.INTERNSHIP]);
    const vp = res.jobs.find((j) => j.title === 'VP, Embodied Systems');
    expect(vp!.jobType).toBeNull();
  });

  it('attaches rendered Airtable descriptions; LinkedIn jobs get none', async () => {
    respondOk();
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 9999 }));
    const airtableJobs = res.jobs.filter((j) => j.jobUrl?.includes('airtable.com'));
    const linkedinJobs = res.jobs.filter((j) => j.jobUrl?.includes('linkedin.com'));
    expect(airtableJobs).toHaveLength(5);
    expect(linkedinJobs).toHaveLength(5);
    expect(gotoMock).toHaveBeenCalledTimes(5);
    expect(airtableJobs.every((j) => j.description === 'Rendered Airtable job description.')).toBe(
      true,
    );
    expect(linkedinJobs.every((j) => !j.description)).toBe(true);
  });

  it('emits the job without description when an Airtable render fails', async () => {
    respondOk();
    evaluateMock
      .mockResolvedValueOnce('Rendered Airtable job description.')
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValue('Rendered Airtable job description.');
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 9999 }));
    expect(res.jobs).toHaveLength(10);
    const airtableJobs = res.jobs.filter((j) => j.jobUrl?.includes('airtable.com'));
    expect(airtableJobs.filter((j) => j.description)).toHaveLength(4);
    expect(airtableJobs.filter((j) => !j.description)).toHaveLength(1);
  });

  it('returns an empty diagnostic when the shell has no bundle reference', async () => {
    getMock.mockResolvedValue({ data: '<html><body>no scripts</body></html>' });
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics?.reason).toBe('empty');
  });

  it('returns an empty diagnostic when the bundle has no job entries', async () => {
    respondOk('var x = [1,2,3]; function f(){return x;}');
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics?.reason).toBe('empty');
  });

  it('returns diagnostics when the careers fetch fails', async () => {
    getMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics).toBeDefined();
  });

  it('honors searchTerm, location, offset and resultsWanted', async () => {
    respondOk();
    const res = await service.scrape(
      new ScraperInputDto({ resultsWanted: 9999, searchTerm: 'intern' }),
    );
    expect(res.jobs.length).toBeGreaterThan(0);
    expect(res.jobs.every((j) => /intern/i.test(j.title) || /intern/i.test(j.description ?? ''))).toBe(
      true,
    );

    const sliced = await service.scrape(new ScraperInputDto({ resultsWanted: 3, offset: 2 }));
    expect(sliced.jobs).toHaveLength(3);
  });
});
