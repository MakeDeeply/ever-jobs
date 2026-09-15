import { canonicalJobId, canonicalKey } from '@ever-jobs/common';

describe('canonicalKey (Spec 003 / T05)', () => {
  it('joins normalised triple with pipes', () => {
    const key = canonicalKey({
      company: 'Acme, Inc.',
      title: 'Sr. Software Engineer',
      location: 'Remote, US',
    });
    expect(key).toBe('acme|senior swe|remote');
  });

  it('returns the same key regardless of source-side cosmetic differences', () => {
    const a = canonicalKey({
      company: 'ACME Corporation',
      title: 'Senior Software Engineer (Remote)',
      location: 'Anywhere',
    });
    const b = canonicalKey({
      company: 'Acme, Inc.',
      title: 'Sr. SWE',
      location: 'Remote',
    });
    expect(a).toBe(b);
  });

  it('handles null/undefined inputs gracefully', () => {
    expect(canonicalKey({ company: null, title: null, location: null })).toBe('||');
    expect(canonicalKey({ company: undefined, title: undefined, location: undefined })).toBe('||');
  });

  it('returns DIFFERENT keys for different titles', () => {
    const a = canonicalKey({ company: 'Acme', title: 'Engineer', location: 'NYC' });
    const b = canonicalKey({ company: 'Acme', title: 'Manager', location: 'NYC' });
    expect(a).not.toBe(b);
  });
});

describe('canonicalJobId (Spec 003 / T05)', () => {
  it('produces a 64-char lower-case hex digest', () => {
    const id = canonicalJobId({ company: 'Acme', title: 'Engineer', location: 'NYC' });
    expect(id).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic', () => {
    const args = { company: 'Acme', title: 'Engineer', location: 'NYC' };
    expect(canonicalJobId(args)).toBe(canonicalJobId(args));
  });

  it('different inputs produce different ids', () => {
    expect(
      canonicalJobId({ company: 'Acme', title: 'Engineer', location: 'NYC' }),
    ).not.toBe(canonicalJobId({ company: 'Acme', title: 'Manager', location: 'NYC' }));
  });

  it('cosmetic-only differences collapse to the SAME id', () => {
    const a = canonicalJobId({
      company: 'ACME Corporation',
      title: 'Senior Software Engineer (Remote)',
      location: 'Anywhere',
    });
    const b = canonicalJobId({
      company: 'Acme, Inc.',
      title: 'Sr. SWE',
      location: 'Remote',
    });
    expect(a).toBe(b);
  });

  it('empty inputs still produce a valid hex id', () => {
    const id = canonicalJobId({ company: '', title: '', location: '' });
    expect(id).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('canonicalKey — locations[] site set (Spec 5123)', () => {
  it('derives the location component from locations[] triples, ignoring the flat string', () => {
    const a = canonicalKey({
      company: 'Acme',
      title: 'Engineer',
      location: 'Amsterdam; Austin, TX',
      locations: [
        { city: 'Amsterdam', country: 'NL' },
        { city: 'Austin', state: 'TX' },
      ],
    });
    const b = canonicalKey({
      company: 'Acme',
      title: 'Engineer',
      location: 'something else entirely',
      locations: [
        { city: 'Austin', state: 'Texas' },
        { city: 'Amsterdam', country: 'NL' },
      ],
    });
    expect(a).toBe(b);
  });

  it('is order-insensitive across the site set', () => {
    const forward = canonicalKey({
      company: 'Acme',
      title: 'Engineer',
      location: 'x',
      locations: [{ city: 'Denver', state: 'CO' }, { city: 'Tulsa', state: 'OK' }],
    });
    const reverse = canonicalKey({
      company: 'Acme',
      title: 'Engineer',
      location: 'x',
      locations: [{ city: 'Tulsa', state: 'OK' }, { city: 'Denver', state: 'CO' }],
    });
    expect(forward).toBe(reverse);
  });

  it('differs when the site set differs', () => {
    const one = canonicalKey({
      company: 'Acme',
      title: 'Engineer',
      location: 'x',
      locations: [{ city: 'Amsterdam', country: 'NL' }],
    });
    const two = canonicalKey({
      company: 'Acme',
      title: 'Engineer',
      location: 'x',
      locations: [
        { city: 'Amsterdam', country: 'NL' },
        { city: 'Austin', state: 'TX' },
      ],
    });
    expect(one).not.toBe(two);
  });

  it('falls back to the flat location string when locations[] yields no geography', () => {
    const withTextOnly = canonicalKey({
      company: 'Acme',
      title: 'Engineer',
      location: 'Remote',
      locations: [{}],
    });
    const noLocations = canonicalKey({
      company: 'Acme',
      title: 'Engineer',
      location: 'Remote',
    });
    expect(withTextOnly).toBe(noLocations);
  });
});
