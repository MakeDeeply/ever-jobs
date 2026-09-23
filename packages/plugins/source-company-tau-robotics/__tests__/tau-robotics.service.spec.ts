import { readFileSync } from 'fs';
import { join } from 'path';
import { ScraperInputDto, Site } from '@ever-jobs/models';

const careersHtml = readFileSync(join(__dirname, 'fixtures', 'careers.html'), 'utf8');
const applyJs = readFileSync(join(__dirname, 'fixtures', 'apply.js'), 'utf8');

const getMock = jest.fn();
jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(() => ({ get: getMock })),
  };
});

import { TauRoboticsService } from '../src/tau-robotics.service';

function respondWith(careers: string, apply: string | Error): void {
  getMock.mockImplementation((url: string) => {
    if (url.endsWith('apply.js')) {
      if (apply instanceof Error) return Promise.reject(apply);
      return Promise.resolve({ data: apply });
    }
    return Promise.resolve({ data: careers });
  });
}

describe('TauRoboticsService', () => {
  let service: TauRoboticsService;

  beforeEach(() => {
    getMock.mockReset();
    service = new TauRoboticsService();
  });

  it('maps all 8 roles from the careers anchors', async () => {
    respondWith(careersHtml, applyJs);
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(8);
    expect(res.diagnostics).toBeUndefined();

    const world = res.jobs.find((j) => j.id === 'tau-robotics-world-models');
    expect(world).toBeDefined();
    expect(world!.title).toBe('Research Engineer/Scientist, World Models');
    expect(world!.site).toBe(Site.TAU_ROBOTICS);
    expect(world!.atsType).toBe('tau-robotics');
    expect(world!.companyName).toBe('Tau Robotics');
    expect(world!.jobUrl).toBe('https://www.tau-robotics.com/apply.html?role=world-models');
    expect(world!.department).toBe('Research');
    expect(world!.location?.city).toBe('San Francisco');
    expect(world!.jobType).toEqual(['fulltime']);
  });

  it('skips the open-application link', async () => {
    respondWith(careersHtml, applyJs);
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs.some((j) => j.atsId === 'open-application')).toBe(false);
  });

  it('populates description from the apply.js ROLES map', async () => {
    respondWith(careersHtml, applyJs);
    const res = await service.scrape(new ScraperInputDto({}));
    const world = res.jobs.find((j) => j.id === 'tau-robotics-world-models');
    expect(world!.description).toContain('Responsibilities:');
    expect(world!.description).toContain('world models');
    expect(world!.description).toContain('Requirements:');
    expect(world!.description).toContain('PyTorch');
  });

  it('emits rows without descriptions when apply.js is unavailable', async () => {
    respondWith(careersHtml, new Error('404'));
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(8);
    expect(res.jobs.every((j) => !j.description)).toBe(true);
  });

  it('emits a row without description for a slug missing from ROLES', async () => {
    const partialApplyJs = `const ROLES = {\n  'world-models': {\n    title: 'Research Engineer/Scientist, World Models',\n    meta: 'Research · San Francisco · Full-time',\n    responsibilities: ['Do things'],\n    requirements: ['Know things'],\n  },\n};\n`;
    respondWith(careersHtml, partialApplyJs);
    const res = await service.scrape(new ScraperInputDto({}));
    expect(res.jobs).toHaveLength(8);
    const world = res.jobs.find((j) => j.id === 'tau-robotics-world-models');
    const other = res.jobs.find((j) => j.id === 'tau-robotics-robotics-technician');
    expect(world!.description).toContain('Do things');
    expect(other!.description).toBeUndefined();
  });

  it('returns an empty diagnostic when the careers page has no role anchors', async () => {
    respondWith('<html><body><p>no roles</p></body></html>', applyJs);
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

  it('honors resultsWanted', async () => {
    respondWith(careersHtml, applyJs);
    const res = await service.scrape(new ScraperInputDto({ resultsWanted: 3 }));
    expect(res.jobs).toHaveLength(3);
  });
});
