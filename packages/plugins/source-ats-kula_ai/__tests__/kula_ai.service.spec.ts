import { Test } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import {
  DescriptionFormat,
  JobType,
  ScraperInputDto,
  Site,
} from '@ever-jobs/models';
import { createHttpClient, parseJobPostingLd } from '@ever-jobs/common';
import { KulaAiService } from '../src/kula_ai.service';
import { KulaAiModule } from '../src/kula_ai.module';

jest.mock('@ever-jobs/common', () => {
  const actual = jest.requireActual('@ever-jobs/common');
  return {
    ...actual,
    createHttpClient: jest.fn(),
  };
});

describe('KulaAiService', () => {
  let service: KulaAiService;

  const feedXml = fs.readFileSync(path.join(__dirname, 'fixtures', 'shinkei-feed.xml'), 'utf8');
  const detail32624Html = fs.readFileSync(
    path.join(__dirname, 'fixtures', 'shinkei-detail-32624.html'),
    'utf8',
  );
  const detail54329Html = fs.readFileSync(
    path.join(__dirname, 'fixtures', 'shinkei-detail-54329.html'),
    'utf8',
  );
  const listHtml = fs.readFileSync(path.join(__dirname, 'fixtures', 'shinkei-list.html'), 'utf8');

  const ld32624 = parseJobPostingLd(detail32624Html)[0];
  const ld54329 = parseJobPostingLd(detail54329Html)[0];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [KulaAiModule],
    }).compile();
    service = module.get(KulaAiService);
    (createHttpClient as jest.Mock).mockClear();
  });

  describe('parseFeed', () => {
    it('extracts 25 XML items from the shinkei fixture', () => {
      const map = (service as any).parseFeed(feedXml, 'shinkei');
      expect(map.size).toBe(25);
      expect(map.has('32624')).toBe(true);
      expect(map.has('54329')).toBe(false);

      const item = map.get('32624');
      expect(item.title).toBe('Mechanical Engineer');
      expect(item.employmentType).toBe('FULL_TIME');
      expect(item.workplace).toBe('OFFICE');
      expect(item.category).toBe('Mechanical');
      expect(item.location.city).toBe('El Segundo');
      expect(item.location.state).toBe('California');
      expect(item.location.country).toBe('United States');
      expect(item.salary.minAmount).toBe('125000.0');
      expect(item.salary.maxAmount).toBe('175000.0');
      expect(item.salary.interval).toBe('YEARLY');
      expect(item.salary.currency).toBe('USD');
    });

    it('extracts an id from the XML link', () => {
      const map = (service as any).parseFeed(feedXml, 'shinkei');
      const first = [...map.values()][0];
      expect(first.link).toContain('/shinkei/32624/');
    });
  });

  describe('parseListHtml', () => {
    it('discovers 26 jobs including the Marketing Intern not in the XML feed', () => {
      const rows = (service as any).parseListHtml(listHtml, 'shinkei');
      expect(rows.length).toBe(26);

      const intern = rows.find((r: any) => r.id === '54329');
      expect(intern).toBeTruthy();
      expect(intern.title).toBe('Marketing Intern');
      expect(intern.department).toBe('Seremoni');
      expect(intern.location).toBe('El Segundo, California, United States');
      expect(intern.employmentType).toBe('Part Time');
      expect(intern.workplace).toBe('On-Site');
      expect(intern.applyUrl).toBe('https://careers.kula.ai/shinkei/54329/');
    });

    it('contains the Mechanical Engineer from the feed', () => {
      const rows = (service as any).parseListHtml(listHtml, 'shinkei');
      const mech = rows.find((r: any) => r.id === '32624');
      expect(mech).toBeTruthy();
      expect(mech.title).toBe('Mechanical Engineer');
    });
  });

  describe('toJobPost', () => {
    it('merges XML feed and JSON-LD detail for a full-time role', () => {
      const feedMap = (service as any).parseFeed(feedXml, 'shinkei');
      const xml = feedMap.get('32624');
      const job = (service as any).toJobPost(
        '32624',
        xml,
        ld32624,
        undefined,
        'shinkei',
        DescriptionFormat.MARKDOWN,
      )!;

      expect(job).toBeTruthy();
      expect(job.id).toBe('kula_ai-32624');
      expect(job.atsId).toBe('32624');
      expect(job.atsType).toBe('kula_ai');
      expect(job.site).toBe(Site.KULA_AI);
      expect(job.title).toBe('Mechanical Engineer');
      expect(job.companyName).toBe('Shinkei');
      expect(job.jobUrl).toBe('https://careers.kula.ai/shinkei/32624/');
      expect(job.location?.city).toBe('El Segundo');
      expect(job.location?.state).toBe('California');
      expect(job.location?.country).toBe('United States');
      expect(job.compensation?.minAmount).toBe(125000);
      expect(job.compensation?.maxAmount).toBe(175000);
      expect(job.compensation?.currency).toBe('USD');
      expect(job.compensation?.interval).toBe('yearly');
      expect(job.jobType).toContain(JobType.FULL_TIME);
      expect(job.isRemote).toBe(false);
      expect(job.workFromHomeType).toBe('On-site');
      expect(job.description).toMatch(/What You Get To Do/i);
    });

    it('produces an hourly intern job from the detail page alone', () => {
      const row = (service as any).parseListHtml(listHtml, 'shinkei').find(
        (r: any) => r.id === '54329',
      );
      const job = (service as any).toJobPost(
        '54329',
        undefined,
        ld54329,
        row,
        'shinkei',
        DescriptionFormat.MARKDOWN,
      )!;

      expect(job).toBeTruthy();
      expect(job.id).toBe('kula_ai-54329');
      expect(job.title).toBe('Marketing Intern');
      expect(job.companyName).toBe('Shinkei');
      expect(job.compensation?.minAmount).toBe(19);
      expect(job.compensation?.maxAmount).toBe(20);
      expect(job.compensation?.interval).toBe('hourly');
      expect(job.jobType).toContain(JobType.PART_TIME);
      expect(job.jobType).toContain(JobType.INTERNSHIP);
      expect(job.description).toMatch(/Marketing Intern/i);
    });
  });

  describe('scrape', () => {
    it('returns merged XML + detail jobs and includes the HTML-only extra', async () => {
      (createHttpClient as jest.Mock).mockReturnValue({
        get: jest.fn(async (url: string) => {
          if (url.includes('/feed')) {
            return { data: feedXml };
          }
          if (url.includes('/32624/')) {
            return { data: detail32624Html };
          }
          if (url.includes('/54329/')) {
            return { data: detail54329Html };
          }
          throw new Error(`Unexpected detail fetch: ${url}`);
        }),
      });

      jest.spyOn(service as any, 'renderList').mockResolvedValue([
        {
          id: '32624',
          title: 'Mechanical Engineer',
          department: 'Mechanical',
          location: 'El Segundo, California, United States',
          employmentType: 'Full Time',
          workplace: 'On-Site',
          applyUrl: 'https://careers.kula.ai/shinkei/32624/',
        },
        {
          id: '54329',
          title: 'Marketing Intern',
          department: 'Seremoni',
          location: 'El Segundo, California, United States',
          employmentType: 'Part Time',
          workplace: 'On-Site',
          applyUrl: 'https://careers.kula.ai/shinkei/54329/',
        },
      ]);

      const input = new ScraperInputDto();
      input.companySlug = 'shinkei';
      input.descriptionFormat = DescriptionFormat.MARKDOWN;
      input.resultsWanted = 100;

      const response = await service.scrape(input);
      const byId = new Map(response.jobs.map((j) => [j.atsId, j]));

      expect(response.jobs.length).toBeGreaterThanOrEqual(2);
      expect(byId.has('32624')).toBe(true);
      expect(byId.has('54329')).toBe(true);

      const mech = byId.get('32624');
      expect(mech?.compensation?.minAmount).toBe(125000);
      expect(mech?.compensation?.maxAmount).toBe(175000);
      expect(mech?.compensation?.interval).toBe('yearly');
      expect(mech?.jobType).toContain(JobType.FULL_TIME);

      const intern = byId.get('54329');
      expect(intern?.compensation?.minAmount).toBe(19);
      expect(intern?.compensation?.maxAmount).toBe(20);
      expect(intern?.compensation?.interval).toBe('hourly');
      expect(intern?.jobType).toContain(JobType.INTERNSHIP);
    });

    it('returns bad_input diagnostics when no account is resolvable', async () => {
      const input = new ScraperInputDto();
      const response = await service.scrape(input);
      expect(response.jobs).toEqual([]);
      expect(response.diagnostics?.reason).toBe('bad_input');
    });
  });
});
