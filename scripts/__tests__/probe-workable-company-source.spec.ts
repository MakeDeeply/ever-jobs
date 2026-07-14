/**
 * Unit tests for the pure decision surface of
 * `probe-workable-company-source.ts` — `gateBoard`, `extractListings`, and
 * `boardUrl`. No live network: every case pins a hand-built Workable
 * `{ jobs: [...] }` widget envelope so the gate + extraction logic is exercised
 * deterministically.
 */
import {
  MIN_JOBS,
  boardUrl,
  extractListings,
  gateBoard,
} from '../probe-workable-company-source';

/** Build a minimal raw Workable widget job. */
function job(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    shortcode: 'ABC123',
    title: 'Software Engineer',
    department: 'Engineering',
    telecommuting: false,
    city: 'Athens',
    state: 'Attica',
    country: 'Greece',
    published_on: '2026-06-22',
    ...over,
  };
}

/** Wrap jobs in the Workable `{ jobs: [...] }` widget envelope. */
function envelope(jobs: unknown[]): unknown {
  return { jobs };
}

describe('boardUrl', () => {
  it('builds the public shared-host widget URL', () => {
    expect(boardUrl('acme')).toBe(
      'https://apply.workable.com/api/v1/widget/accounts/acme',
    );
  });

  it('url-encodes the slug', () => {
    expect(boardUrl('foo bar')).toBe(
      'https://apply.workable.com/api/v1/widget/accounts/foo%20bar',
    );
  });
});

describe('extractListings', () => {
  it('reads the jobs array off the envelope', () => {
    const out = extractListings(
      envelope([job(), job({ shortcode: 'D2', title: 'PM' })]),
      10,
    );
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({
      id: 'ABC123',
      title: 'Software Engineer',
      location: 'Athens, Attica, Greece',
      department: 'Engineering',
      updatedAt: new Date('2026-06-22').toISOString(),
    });
  });

  it('caps output at the requested limit', () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      job({ shortcode: `S${i}`, title: `Role ${i}` }),
    );
    expect(extractListings(envelope(many), 3)).toHaveLength(3);
  });

  it('skips jobs with a blank/whitespace title', () => {
    const out = extractListings(
      envelope([job({ title: '   ' }), job({ shortcode: 'R2', title: 'Real' })]),
      10,
    );
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Real');
  });

  it('prefers the structured locations[] entry over flat fields', () => {
    const out = extractListings(
      envelope([
        job({
          city: 'ignored',
          state: null,
          country: 'ignored',
          locations: [{ city: 'Berlin', region: null, country: 'Germany' }],
        }),
      ]),
      10,
    );
    expect(out[0].location).toBe('Berlin, Germany');
  });

  it('composes location from flat city/state/country when locations[] is absent', () => {
    const out = extractListings(
      envelope([
        job({ city: 'Lisbon', state: null, country: 'Portugal', locations: null }),
      ]),
      10,
    );
    expect(out[0].location).toBe('Lisbon, Portugal');
  });

  it('falls back to Remote when only the telecommuting flag is set', () => {
    const out = extractListings(
      envelope([
        job({ city: null, state: null, country: null, telecommuting: true }),
      ]),
      10,
    );
    expect(out[0].location).toBe('Remote');
  });

  it('yields a null location when nothing is provided', () => {
    const out = extractListings(
      envelope([
        job({ city: null, state: null, country: null, telecommuting: false }),
      ]),
      10,
    );
    expect(out[0].location).toBeNull();
  });

  it('trims padded title / department wire data', () => {
    const out = extractListings(
      envelope([job({ title: '  Data Scientist  ', department: '  Data  ' })]),
      10,
    );
    expect(out[0].title).toBe('Data Scientist');
    expect(out[0].department).toBe('Data');
  });

  it('falls back to created_at when published_on is absent', () => {
    const out = extractListings(
      envelope([job({ published_on: null, created_at: '2026-01-02T03:04:05Z' })]),
      10,
    );
    expect(out[0].updatedAt).toBe(
      new Date('2026-01-02T03:04:05Z').toISOString(),
    );
  });

  it('yields null updatedAt for an unparseable timestamp', () => {
    const out = extractListings(
      envelope([job({ published_on: 'not-a-date', created_at: null })]),
      10,
    );
    expect(out[0].updatedAt).toBeNull();
  });

  it('uses code as the id when shortcode is absent', () => {
    const out = extractListings(
      envelope([job({ shortcode: null, code: 'CODE9' })]),
      10,
    );
    expect(out[0].id).toBe('CODE9');
  });

  it('returns [] for a non-envelope / missing jobs array', () => {
    expect(extractListings(null, 10)).toEqual([]);
    expect(extractListings({}, 10)).toEqual([]);
    expect(extractListings({ jobs: 'nope' }, 10)).toEqual([]);
  });
});

describe('gateBoard', () => {
  it('survives a board with >= MIN_JOBS title-bearing jobs', () => {
    const jobs = Array.from({ length: MIN_JOBS }, (_, i) =>
      job({ shortcode: `S${i}`, title: `Role ${i}` }),
    );
    const s = gateBoard('acme', envelope(jobs));
    expect(s).not.toBeNull();
    expect(s?.slug).toBe('acme');
    expect(s?.jobCount).toBe(MIN_JOBS);
    expect(s?.listings.length).toBeLessThanOrEqual(3);
  });

  it('captures the envelope name into boardName when present', () => {
    const jobs = Array.from({ length: MIN_JOBS }, (_, i) =>
      job({ shortcode: `S${i}`, title: `Role ${i}` }),
    );
    const s = gateBoard('acme', { name: 'Acme Inc', jobs });
    expect(s?.boardName).toBe('Acme Inc');
  });

  it('falls back to an empty boardName when the envelope name is absent', () => {
    const jobs = Array.from({ length: MIN_JOBS }, (_, i) =>
      job({ shortcode: `S${i}`, title: `Role ${i}` }),
    );
    expect(gateBoard('acme', envelope(jobs))?.boardName).toBe('');
  });

  it('rejects a board with fewer than MIN_JOBS jobs', () => {
    const jobs = Array.from({ length: MIN_JOBS - 1 }, (_, i) =>
      job({ shortcode: `S${i}`, title: `Role ${i}` }),
    );
    expect(gateBoard('acme', envelope(jobs))).toBeNull();
  });

  it('rejects a board padded with untitled jobs below the threshold', () => {
    const jobs = [
      job({ shortcode: '1', title: 'Only Real Role' }),
      job({ shortcode: '2', title: '' }),
      job({ shortcode: '3', title: '   ' }),
    ];
    expect(gateBoard('acme', envelope(jobs))).toBeNull();
  });

  it('caps seed listings at 3 even for a large board', () => {
    const jobs = Array.from({ length: 25 }, (_, i) =>
      job({ shortcode: `S${i}`, title: `Role ${i}` }),
    );
    const s = gateBoard('big', envelope(jobs));
    expect(s?.jobCount).toBe(25);
    expect(s?.listings).toHaveLength(3);
  });

  it('returns null for a non-object / missing-jobs payload', () => {
    expect(gateBoard('x', null)).toBeNull();
    expect(gateBoard('x', {})).toBeNull();
    expect(gateBoard('x', { jobs: null })).toBeNull();
  });
});
