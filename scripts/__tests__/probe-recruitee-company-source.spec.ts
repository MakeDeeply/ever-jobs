/**
 * Unit tests for the pure decision surface of
 * `probe-recruitee-company-source.ts` — `gateBoard`, `extractListings`, and
 * `boardUrl`. No live network: every case pins a hand-built Recruitee
 * `{ offers: [...] }` envelope so the gate + extraction logic is exercised
 * deterministically.
 */
import {
  MIN_JOBS,
  boardUrl,
  extractListings,
  gateBoard,
} from '../probe-recruitee-company-source';

/** Build a minimal raw Recruitee offer. */
function offer(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 101,
    title: 'Software Engineer',
    location: 'Utrecht, Netherlands',
    department: 'Engineering',
    remote: false,
    company_name: 'Acme BV',
    created_at: '2026-06-22 13:37:27 UTC',
    ...over,
  };
}

/** Wrap offers in the Recruitee `{ offers: [...] }` envelope. */
function envelope(offers: unknown[]): unknown {
  return { offers };
}

describe('boardUrl', () => {
  it('builds the public per-subdomain offers URL', () => {
    expect(boardUrl('channable')).toBe(
      'https://channable.recruitee.com/api/offers',
    );
  });

  it('url-encodes the slug', () => {
    expect(boardUrl('foo bar')).toBe(
      'https://foo%20bar.recruitee.com/api/offers',
    );
  });
});

describe('extractListings', () => {
  it('reads the offers array off the envelope', () => {
    const out = extractListings(
      envelope([offer(), offer({ id: 102, title: 'PM' })]),
      10,
    );
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({
      id: 101,
      title: 'Software Engineer',
      location: 'Utrecht, Netherlands',
      department: 'Engineering',
      updatedAt: new Date('2026-06-22T13:37:27Z').toISOString(),
    });
  });

  it('caps output at the requested limit', () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      offer({ id: i, title: `Role ${i}` }),
    );
    expect(extractListings(envelope(many), 3)).toHaveLength(3);
  });

  it('skips offers with a blank/whitespace title', () => {
    const out = extractListings(
      envelope([offer({ title: '   ' }), offer({ id: 2, title: 'Real' })]),
      10,
    );
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Real');
  });

  it('composes location from city/state/country when location is absent', () => {
    const out = extractListings(
      envelope([
        offer({ location: null, city: 'Berlin', state: null, country: 'Germany' }),
      ]),
      10,
    );
    expect(out[0].location).toBe('Berlin, Germany');
  });

  it('falls back to Remote when only the remote flag is set', () => {
    const out = extractListings(
      envelope([offer({ location: null, city: null, country: null, remote: true })]),
      10,
    );
    expect(out[0].location).toBe('Remote');
  });

  it('yields a null location when nothing is provided', () => {
    const out = extractListings(
      envelope([offer({ location: null, city: null, country: null, remote: false })]),
      10,
    );
    expect(out[0].location).toBeNull();
  });

  it('trims padded title / department wire data', () => {
    const out = extractListings(
      envelope([offer({ title: '  Data Scientist  ', department: '  Data  ' })]),
      10,
    );
    expect(out[0].title).toBe('Data Scientist');
    expect(out[0].department).toBe('Data');
  });

  it('parses a strict ISO created_at as well as the loose UTC form', () => {
    const out = extractListings(
      envelope([offer({ created_at: '2026-01-02T03:04:05Z' })]),
      10,
    );
    expect(out[0].updatedAt).toBe(new Date('2026-01-02T03:04:05Z').toISOString());
  });

  it('yields null updatedAt for an unparseable timestamp', () => {
    const out = extractListings(envelope([offer({ created_at: 'not-a-date' })]), 10);
    expect(out[0].updatedAt).toBeNull();
  });

  it('returns [] for a non-envelope / missing offers array', () => {
    expect(extractListings(null, 10)).toEqual([]);
    expect(extractListings({}, 10)).toEqual([]);
    expect(extractListings({ offers: 'nope' }, 10)).toEqual([]);
  });
});

describe('gateBoard', () => {
  it('survives a board with >= MIN_JOBS title-bearing offers', () => {
    const offers = Array.from({ length: MIN_JOBS }, (_, i) =>
      offer({ id: i, title: `Role ${i}` }),
    );
    const s = gateBoard('acme', envelope(offers));
    expect(s).not.toBeNull();
    expect(s?.slug).toBe('acme');
    expect(s?.jobCount).toBe(MIN_JOBS);
    expect(s?.listings.length).toBeLessThanOrEqual(3);
  });

  it('captures company_name from the first offer into boardName', () => {
    const offers = Array.from({ length: MIN_JOBS }, (_, i) =>
      offer({ id: i, title: `Role ${i}`, company_name: 'Channable' }),
    );
    expect(gateBoard('channable', envelope(offers))?.boardName).toBe('Channable');
  });

  it('falls back to an empty boardName when company_name is absent', () => {
    const offers = Array.from({ length: MIN_JOBS }, (_, i) =>
      offer({ id: i, title: `Role ${i}`, company_name: null }),
    );
    expect(gateBoard('x', envelope(offers))?.boardName).toBe('');
  });

  it('rejects a board with fewer than MIN_JOBS offers', () => {
    const offers = Array.from({ length: MIN_JOBS - 1 }, (_, i) =>
      offer({ id: i, title: `Role ${i}` }),
    );
    expect(gateBoard('acme', envelope(offers))).toBeNull();
  });

  it('rejects a board padded with untitled offers below the threshold', () => {
    const offers = [
      offer({ id: 1, title: 'Only Real Role' }),
      offer({ id: 2, title: '' }),
      offer({ id: 3, title: '   ' }),
    ];
    expect(gateBoard('acme', envelope(offers))).toBeNull();
  });

  it('caps seed listings at 3 even for a large board', () => {
    const offers = Array.from({ length: 25 }, (_, i) =>
      offer({ id: i, title: `Role ${i}` }),
    );
    const s = gateBoard('big', envelope(offers));
    expect(s?.jobCount).toBe(25);
    expect(s?.listings).toHaveLength(3);
  });

  it('returns null for a non-object / missing-offers payload', () => {
    expect(gateBoard('x', null)).toBeNull();
    expect(gateBoard('x', {})).toBeNull();
    expect(gateBoard('x', { offers: null })).toBeNull();
  });
});
