import { createHttpClient } from '@ever-jobs/common';
import { ScraperInputDto, Site } from '@ever-jobs/models';
import { EightfoldService } from '../src/eightfold.service';
import {
  EIGHTFOLD_JOBS_PATH,
  EIGHTFOLD_PCSX_SEARCH_PATH,
  EIGHTFOLD_PAGE_SIZE,
} from '../src/eightfold.constants';
import type { EightfoldPosition } from '../src/eightfold.types';

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(),
  };
});

const POSITION: EightfoldPosition = {
  id: 563980770511471,
  displayJobId: 'JR-2603147',
  name: 'MCU Architect',
  locations: ['Bangalore, Karnataka, India'],
  department: 'Business Units',
};

function pcsxBody(positions: EightfoldPosition[] = [POSITION], count = 1) {
  return {
    status: 200,
    error: { message: '', body: '' },
    data: { positions, count },
  };
}

describe('EightfoldService endpoint resolution', () => {
  let service: EightfoldService;
  let getMock: jest.Mock;

  beforeEach(() => {
    service = new EightfoldService();
    getMock = jest.fn();
    (createHttpClient as jest.Mock).mockReturnValue({
      get: getMock,
      setHeaders: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const input = () =>
    new ScraperInputDto({
      companySlug: 'globalfoundries',
      companyUrl: 'https://careers.gf.com',
      resultsWanted: 999,
    });

  it('uses the SmartApply endpoint when it returns a valid payload', async () => {
    getMock.mockResolvedValue({ data: { positions: [POSITION], count: 1 } });

    const res = await service.scrape(input());

    expect(res.jobs).toHaveLength(1);
    expect(res.jobs[0].site).toBe(Site.EIGHTFOLD);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock.mock.calls[0][0]).toContain(EIGHTFOLD_JOBS_PATH);
  });

  it('falls back to PCSX search when SmartApply is gated', async () => {
    getMock.mockImplementation((url: string) => {
      if (url.includes(EIGHTFOLD_JOBS_PATH)) {
        return Promise.resolve({ data: { message: 'Not authorized for PCSX' } });
      }
      if (url.includes(EIGHTFOLD_PCSX_SEARCH_PATH)) {
        return Promise.resolve({ data: pcsxBody() });
      }
      return Promise.reject(new Error('unexpected url ' + url));
    });

    const res = await service.scrape(input());

    expect(res.jobs).toHaveLength(1);
    expect(res.jobs[0].atsId).toBe('JR-2603147');
    expect(res.jobs[0].department).toBe('Business Units');
    expect(getMock).toHaveBeenCalledTimes(2);
    expect(getMock.mock.calls[1][0]).toContain(EIGHTFOLD_PCSX_SEARCH_PATH);
  });

  it('falls back to PCSX search when SmartApply returns the HTML shell', async () => {
    getMock.mockImplementation((url: string) => {
      if (url.includes(EIGHTFOLD_JOBS_PATH)) {
        return Promise.resolve({ data: '<!DOCTYPE html><html>...</html>' });
      }
      if (url.includes(EIGHTFOLD_PCSX_SEARCH_PATH)) {
        return Promise.resolve({ data: pcsxBody() });
      }
      return Promise.reject(new Error('unexpected url ' + url));
    });

    const res = await service.scrape(input());

    expect(res.jobs).toHaveLength(1);
    expect(getMock.mock.calls[1][0]).toContain(EIGHTFOLD_PCSX_SEARCH_PATH);
  });

  it('does not fall back on a legitimately empty board', async () => {
    getMock.mockResolvedValue({ data: { positions: [], count: 0 } });

    const res = await service.scrape(input());

    expect(res.jobs).toHaveLength(0);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock.mock.calls[0][0]).toContain(EIGHTFOLD_JOBS_PATH);
  });

  it('falls back to PCSX search when SmartApply answers with an HTTP error', async () => {
    // careers.gf.com behavior: apply/v2 → 403 (throws), pcsx/search → 200.
    const err = Object.assign(new Error('Request failed with status code 403'), {
      response: { status: 403 },
    });
    getMock.mockImplementation((url: string) => {
      if (url.includes(EIGHTFOLD_JOBS_PATH)) return Promise.reject(err);
      if (url.includes(EIGHTFOLD_PCSX_SEARCH_PATH)) {
        return Promise.resolve({ data: pcsxBody() });
      }
      return Promise.reject(new Error('unexpected url ' + url));
    });

    const res = await service.scrape(input());

    expect(res.jobs).toHaveLength(1);
    expect(res.jobs[0].atsId).toBe('JR-2603147');
    expect(getMock).toHaveBeenCalledTimes(2);
    expect(getMock.mock.calls[1][0]).toContain(EIGHTFOLD_PCSX_SEARCH_PATH);
  });

  it('surfaces diagnostics when every endpoint errors', async () => {
    getMock.mockRejectedValue(new Error('ECONNREFUSED'));

    const res = await service.scrape(input());

    expect(res.jobs).toHaveLength(0);
    expect(res.diagnostics).toBeDefined();
    expect(getMock).toHaveBeenCalledTimes(2);
  });

  it('reuses the resolved endpoint for subsequent pages', async () => {
    // count > PAGE_SIZE forces a second page; gated primary + open PCSX.
    const page2 = { ...POSITION, displayJobId: 'JR-9999999', id: 2 };
    getMock.mockImplementation((url: string) => {
      if (url.includes(EIGHTFOLD_JOBS_PATH)) {
        return Promise.resolve({ data: { message: 'Not authorized for PCSX' } });
      }
      if (url.includes(EIGHTFOLD_PCSX_SEARCH_PATH) && url.includes('start=0')) {
        return Promise.resolve({
          data: pcsxBody(new Array(EIGHTFOLD_PAGE_SIZE).fill(POSITION), EIGHTFOLD_PAGE_SIZE + 1),
        });
      }
      if (url.includes(EIGHTFOLD_PCSX_SEARCH_PATH) && url.includes(`start=${EIGHTFOLD_PAGE_SIZE}`)) {
        return Promise.resolve({ data: pcsxBody([page2], EIGHTFOLD_PAGE_SIZE + 1) });
      }
      return Promise.reject(new Error('unexpected url ' + url));
    });

    const res = await service.scrape(input());

    expect(res.jobs.length).toBeGreaterThan(0);
    const calls = getMock.mock.calls.map((c) => c[0] as string);
    const gatedCalls = calls.filter((u) => u.includes(EIGHTFOLD_JOBS_PATH));
    const pcsxCalls = calls.filter((u) => u.includes(EIGHTFOLD_PCSX_SEARCH_PATH));
    expect(gatedCalls).toHaveLength(1);
    expect(pcsxCalls.length).toBeGreaterThanOrEqual(2);
  });
});
