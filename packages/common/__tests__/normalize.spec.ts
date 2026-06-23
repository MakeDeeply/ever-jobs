import { normalizeCompany, normalizeLocation, normalizeTitle } from '@ever-jobs/common';

describe('normalizeCompany (Spec 003 / T04)', () => {
  it.each<[string, string]>([
    ['Acme, Inc.', 'acme'],
    ['ACME Corporation', 'acme'],
    ['Some Co., Ltd.', 'some'],
    ['Müller GmbH', 'muller'],
    ['OpenAI, L.L.C.', 'openai'],
    ['Stripe', 'stripe'],
    ['Smith & Sons Inc', 'smith sons'],
    ['Apple Computer Inc.', 'apple computer'],
    ['Acme Holdings', 'acme'],
    ['  Acme   ', 'acme'],
  ])('normalizeCompany(%j) === %j', (input, expected) => {
    expect(normalizeCompany(input)).toBe(expected);
  });

  it('returns empty string for null/undefined/empty', () => {
    expect(normalizeCompany(null)).toBe('');
    expect(normalizeCompany(undefined)).toBe('');
    expect(normalizeCompany('')).toBe('');
  });

  it('is idempotent', () => {
    const inputs = ['Acme, Inc.', 'ACME Corporation', 'Müller GmbH', 'Smith & Sons Inc'];
    for (const input of inputs) {
      const once = normalizeCompany(input);
      const twice = normalizeCompany(once);
      expect(twice).toBe(once);
    }
  });
});

describe('normalizeTitle (Spec 003 / T04)', () => {
  it.each<[string, string]>([
    ['Sr. Software Engineer', 'senior swe'],
    ['Senior Software Engineer (Remote)', 'senior swe'],
    ['ML Engineer III', 'ml engineer 3'],
    ['Senior  Software   Engineer', 'senior swe'],
    ['Software Engineer II', 'swe 2'],
    ['Jr Data Scientist', 'junior ds'],
    ['Backend Engineer / Go', 'backend engineer go'],
    ['Engineer | Remote', 'engineer remote'],
    ['Site Reliability Engineer', 'sre'],
    ['Product Manager', 'pm'],
  ])('normalizeTitle(%j) === %j', (input, expected) => {
    expect(normalizeTitle(input)).toBe(expected);
  });

  it('returns empty string for null/undefined', () => {
    expect(normalizeTitle(null)).toBe('');
    expect(normalizeTitle(undefined)).toBe('');
  });

  it('is idempotent', () => {
    const inputs = ['Sr. SWE', 'ML Engineer III', 'Senior Software Engineer (Remote)'];
    for (const input of inputs) {
      const once = normalizeTitle(input);
      expect(normalizeTitle(once)).toBe(once);
    }
  });
});

describe('normalizeLocation (Spec 003 / T04)', () => {
  it.each<[string, string]>([
    ['Remote', 'remote'],
    ['Anywhere', 'remote'],
    ['Work From Home', 'remote'],
    ['Remote, US', 'remote'],
    ['San Francisco, CA', 'san francisco california'],
    ['New York, NY, USA', 'new york new york usa'],
    ['Berlin, Germany', 'berlin germany'],
    ['  London,  UK  ', 'london uk'],
  ])('normalizeLocation(%j) === %j', (input, expected) => {
    expect(normalizeLocation(input)).toBe(expected);
  });

  it('returns empty string for null/undefined', () => {
    expect(normalizeLocation(null)).toBe('');
    expect(normalizeLocation(undefined)).toBe('');
  });

  it('is idempotent', () => {
    const inputs = ['San Francisco, CA', 'Remote, US', 'Berlin, Germany'];
    for (const input of inputs) {
      const once = normalizeLocation(input);
      expect(normalizeLocation(once)).toBe(once);
    }
  });

  it('detects remote on every call regardless of call order', () => {
    // Guards against a stateful /g regex whose lastIndex would make
    // consecutive .test() calls alternate match/no-match.
    for (let i = 0; i < 5; i++) {
      expect(normalizeLocation('Anywhere')).toBe('remote');
      expect(normalizeLocation('Remote, US')).toBe('remote');
    }
  });
});
