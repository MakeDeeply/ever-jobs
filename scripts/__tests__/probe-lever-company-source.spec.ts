/**
 * Unit tests for `scripts/probe-lever-company-source.ts`.
 *
 * The probe's network layer (`probeOne`/`getJson`) is intentionally NOT
 * exercised here — these tests pin the pure, deterministic decision surface
 * (`gateBoard`, `extractListings`) that decides whether a Lever job board
 * candidate survives the discovery gate and how its postings are normalised.
 *
 * The public Lever Postings API returns a **bare JSON array** (no `{ jobs }`
 * envelope, no board display name), so the fixtures here are arrays and the
 * gate is purely count-based.
 */
import {
  gateBoard,
  extractListings,
  MIN_JOBS,
} from '../probe-lever-company-source';

/** Public Lever postings payload (bare array) with `n` title-bearing jobs. */
function board(n: number): unknown {
  return Array.from({ length: n }, (_, i) => ({
    id: `abc-${i}`,
    text: ` Role ${i} `, // padded — exercises the trim
    categories: {
      location: ' Remote ',
      department: ` Eng ${i} `,
    },
    createdAt: 1_717_200_000_000, // 2024-06-01T00:00:00.000Z
  }));
}

describe('extractListings', () => {
  it('normalises the first `limit` jobs and trims padded strings', () => {
    const out = extractListings(board(5), 3);
    expect(out).toHaveLength(3);
    expect(out[0].title).toBe('Role 0');
    expect(out[0].location).toBe('Remote');
    expect(out[0].department).toBe('Eng 0');
    expect(out[0].id).toBe('abc-0');
    expect(out[0].updatedAt).toBe('2024-06-01T00:00:00.000Z');
  });

  it('skips jobs with an empty title', () => {
    const raw = [{ id: 1, text: '   ' }, { id: 2, text: 'Real' }];
    const out = extractListings(raw, 5);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Real');
  });

  it('returns [] for non-array input', () => {
    expect(extractListings(null, 3)).toEqual([]);
    expect(extractListings({}, 3)).toEqual([]);
  });

  it('null-coalesces missing nested location/department fields', () => {
    const out = extractListings([{ id: 7, text: 'Solo' }], 3);
    expect(out[0]).toMatchObject({
      id: 7,
      title: 'Solo',
      location: null,
      department: null,
      updatedAt: null,
    });
  });

  it('prefers categories.allLocations[0] over categories.location', () => {
    const out = extractListings(
      [
        {
          id: 9,
          text: 'Multi',
          categories: {
            location: 'Fallback City',
            allLocations: ['Austin, TX', 'Remote'],
          },
        },
      ],
      3,
    );
    expect(out[0].location).toBe('Austin, TX');
  });

  it('falls back to categories.team when department is absent', () => {
    const out = extractListings(
      [{ id: 3, text: 'T', categories: { team: 'Platform' } }],
      3,
    );
    expect(out[0].department).toBe('Platform');
  });

  it('ignores a non-finite createdAt', () => {
    const out = extractListings([{ id: 4, text: 'NaN date', createdAt: NaN }], 3);
    expect(out[0].updatedAt).toBeNull();
  });
});

describe('gateBoard', () => {
  it('returns a Survivor when the board holds >= MIN_JOBS title-bearing jobs', () => {
    const s = gateBoard('acme', board(MIN_JOBS));
    expect(s).not.toBeNull();
    expect(s?.slug).toBe('acme');
    expect(s?.boardName).toBe(''); // Lever exposes no board name
    expect(s?.jobCount).toBe(MIN_JOBS);
    expect(s?.listings).toHaveLength(3);
  });

  it('caps the seeded listings at 3 even when jobCount is larger', () => {
    const s = gateBoard('acme', board(25));
    expect(s?.jobCount).toBe(25);
    expect(s?.listings).toHaveLength(3);
  });

  it('rejects a board below MIN_JOBS', () => {
    expect(gateBoard('acme', board(MIN_JOBS - 1))).toBeNull();
  });

  it('rejects a board whose jobs lack real titles even if the array is long', () => {
    const payload = Array.from({ length: MIN_JOBS + 2 }, (_, i) => ({
      id: i,
      text: '   ',
    }));
    expect(gateBoard('acme', payload)).toBeNull();
  });

  it('rejects a null / non-array payload', () => {
    expect(gateBoard('acme', null)).toBeNull();
    expect(gateBoard('acme', {})).toBeNull();
    expect(gateBoard('acme', { jobs: 'nope' })).toBeNull();
  });

  it('honours a custom minJobs threshold', () => {
    expect(gateBoard('acme', board(4), 5)).toBeNull();
    expect(gateBoard('acme', board(6), 5)).not.toBeNull();
  });
});
