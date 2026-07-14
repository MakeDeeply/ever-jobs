import { readFileSync } from 'fs';
import { join } from 'path';
import { Test } from '@nestjs/testing';
import { JobType, ScraperInputDto, Site } from '@ever-jobs/models';
import { MaraModule } from '../src/mara.module';
import { MaraService } from '../src/mara.service';

const FIXTURES = join(__dirname, 'fixtures');
const read = (name: string): string =>
  readFileSync(join(FIXTURES, `${name}.html`), 'utf8');

const CAREERS = read('mara-careers');
const EMPTY = read('mara-careers-empty');

interface Seams {
  fetchCareersHtml: () => Promise<string>;
}

/**
 * Build a service whose careers fetch returns the captured `/career` page. The
 * scraper only ever reads the on-domain HTML; LinkedIn apply URLs are carried
 * but never fetched.
 */
function makeService(html = CAREERS): MaraService {
  const svc = new MaraService();
  (svc as unknown as Seams).fetchCareersHtml = async () => html;
  return svc;
}

describe('MaraService (Spec 5065 — Mara Defense Webflow careers)', () => {
  it('resolves through the module via NestJS DI', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MaraModule],
    }).compile();
    expect(moduleRef.get(MaraService)).toBeInstanceOf(MaraService);
  });

  it('exports the Site.MARA = "mara" enum value', () => {
    expect(Site.MARA).toBe('mara');
  });

  it('ingests only the two real openings (skips the placeholder card)', async () => {
    const svc = makeService();
    const { jobs } = await svc.scrape(new ScraperInputDto());

    expect(jobs.length).toBe(2);
    // the Webflow template card ("Senior AI engineer", apply href="#") is skipped
    expect(jobs.some((j) => /senior ai engineer/i.test(j.title))).toBe(false);
  });

  it('appends the highlight chip only when it is not already in the title', async () => {
    const svc = makeService();
    const { jobs } = await svc.scrape(new ScraperInputDto());
    const titles = jobs.map((j) => j.title);

    // highlight "Robotics Simulation Engineer" is not in "Wargamer" -> appended
    expect(titles).toContain('Wargamer (Robotics Simulation Engineer)');
    // highlight "Bitcaster" already in the title -> not appended (no duplication)
    expect(titles).toContain('Bitcaster (Embedded Systems / Electrical)');
    expect(titles).not.toContain(
      'Bitcaster (Embedded Systems / Electrical) (Bitcaster)',
    );
  });

  it('derives a title-based id and leaves jobUrl blank with a LinkedIn apply URL', async () => {
    const svc = makeService();
    const { jobs } = await svc.scrape(new ScraperInputDto());
    const wargamer = jobs.find((j) => j.title.startsWith('Wargamer'));

    expect(wargamer).toBeDefined();
    expect(wargamer?.id).toBe('mara-wargamer-robotics-simulation-engineer');
    expect(wargamer?.site).toBe(Site.MARA);
    expect(wargamer?.companyName).toBe('Mara Defense');
    // no on-domain per-role page — jobUrl intentionally blank
    expect(wargamer?.jobUrl).toBe('');
    // apply is off-domain on LinkedIn (linked, never fetched)
    expect(wargamer?.applyUrl).toMatch(/linkedin\.com\/jobs/i);
    expect(wargamer?.jobUrl).not.toMatch(/indeed\.com/i);
  });

  it('maps the stated San Francisco location without fabricating a state', async () => {
    const svc = makeService();
    const { jobs } = await svc.scrape(new ScraperInputDto());
    const job = jobs[0];

    expect(job.location?.city).toBe('San Francisco');
    // the site states no state — never fabricated
    expect(job.location?.state == null).toBe(true);
    expect(job.isRemote).toBe(false);
  });

  it('maps the Full Time chip to FULL_TIME', async () => {
    const svc = makeService();
    const { jobs } = await svc.scrape(new ScraperInputDto());
    const job = jobs[0];

    expect(job.employmentType).toBe('Full Time');
    expect(job.jobType).toEqual([JobType.FULL_TIME]);
  });

  it('leaves compensation, description, posted date and emails empty', async () => {
    const svc = makeService();
    const { jobs } = await svc.scrape(new ScraperInputDto());
    const job = jobs[0];

    expect(job.compensation == null).toBe(true);
    expect(job.description == null || job.description === '').toBe(true);
    expect(job.datePosted).toBeNull();
    expect(job.emails).toEqual([]);
  });

  it('applies searchTerm / offset / resultsWanted filters', async () => {
    const svc = makeService();

    const match = await svc.scrape(
      new ScraperInputDto({ searchTerm: 'bitcaster' }),
    );
    expect(match.jobs.length).toBe(1);

    const miss = await svc.scrape(
      new ScraperInputDto({ searchTerm: 'nonexistent-role-xyz' }),
    );
    expect(miss.jobs.length).toBe(0);

    const limited = await svc.scrape(new ScraperInputDto({ resultsWanted: 1 }));
    expect(limited.jobs.length).toBe(1);
  });

  it('returns nothing (no throw) when the careers page has no openings', async () => {
    const svc = makeService(EMPTY);
    const { jobs } = await svc.scrape(new ScraperInputDto());
    expect(jobs).toEqual([]);
  });
});
