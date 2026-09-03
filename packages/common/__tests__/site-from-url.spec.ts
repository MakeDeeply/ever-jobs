import { resolveCompanyUrl } from '../src/utils/site-from-url';
import { Site } from '@ever-jobs/models';

describe('resolveCompanyUrl', () => {
  it('resolves Greenhouse board URLs and extracts the slug', () => {
    expect(resolveCompanyUrl('https://boards.greenhouse.io/vast')).toEqual({
      site: Site.GREENHOUSE,
      slug: 'vast',
    });
    expect(resolveCompanyUrl('https://job-boards.greenhouse.io/trueanomalyinc/jobs/123')).toEqual({
      site: Site.GREENHOUSE,
      slug: 'trueanomalyinc',
    });
  });

  it('resolves Ashby board URLs and extracts the slug', () => {
    expect(resolveCompanyUrl('https://jobs.ashbyhq.com/northwoodspace')).toEqual({
      site: Site.ASHBY,
      slug: 'northwoodspace',
    });
    expect(resolveCompanyUrl('https://jobs.ashbyhq.com/northwoodspace?department=engineering')).toEqual({
      site: Site.ASHBY,
      slug: 'northwoodspace',
    });
  });

  it('resolves Lever board URLs and extracts the slug', () => {
    expect(resolveCompanyUrl('https://jobs.lever.co/exampleco')).toEqual({
      site: Site.LEVER,
      slug: 'exampleco',
    });
  });

  it('tolerates URLs without a scheme', () => {
    expect(resolveCompanyUrl('boards.greenhouse.io/vast')).toEqual({
      site: Site.GREENHOUSE,
      slug: 'vast',
    });
  });

  it('returns an empty object for unknown hosts', () => {
    expect(resolveCompanyUrl('https://example.com/careers')).toEqual({});
    expect(resolveCompanyUrl('https://careers.ibm.com')).toEqual({});
  });

  it('returns an empty object for malformed input', () => {
    expect(resolveCompanyUrl('')).toEqual({});
    expect(resolveCompanyUrl('   ')).toEqual({});
    expect(resolveCompanyUrl('not a url')).toEqual({});
  });
});
