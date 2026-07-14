/**
 * Unit tests for `scripts/probe-ashby-company-source.ts`.
 *
 * The probe's network layer (`probeOne`/`getJson`) is intentionally NOT
 * exercised here — these tests pin the pure, deterministic decision surface
 * (`gateBoard`, `extractListings`) that decides whether an Ashby job board
 * candidate survives the discovery gate and how its listings are normalised.
 */
import {
  gateBoard,
  extractListings,
  MIN_JOBS,
} from '../probe-ashby-company-source';

/** Public Ashby job-board payload with `n` title-bearing jobs. */
function board(n: number): unknown {
  return {
    apiVersion: '1',
    jobs: Array.from({ length: n }, (_, i) => ({
      id: `job-${i}`,
      title: ` Role ${i} `, // padded — exercises the trim
      location: ' Remote ',
      departmentName: ` Eng ${i} `,
      publishedDate: '2026-06-01',
    })),
  };
}

describe('extractListings', () => {
  it('normalises the first `limit` jobs and trims padded strings', () => {
    const out = extractListings((board(5) as { jobs: unknown[] }).jobs, 3);
    expect(out).toHaveLength(3);
    expect(out[0].title).toBe('Role 0');
    expect(out[0].location).toBe('Remote');
    expect(out[0].department).toBe('Eng 0');
    expect(out[0].id).toBe('job-0');
    expect(out[0].updatedAt).toBe('2026-06-01');
  });

  it('skips jobs with an empty title', () => {
    const raw = [{ id: 1, title: '   ' }, { id: 2, title: 'Real' }];
    const out = extractListings(raw, 5);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Real');
  });

  it('returns [] for non-array input', () => {
    expect(extractListings(null, 3)).toEqual([]);
    expect(extractListings({}, 3)).toEqual([]);
  });

  it('null-coalesces missing nested location/department fields', () => {
    const out = extractListings([{ id: 7, title: 'Solo' }], 3);
    expect(out[0]).toMatchObject({
      id: 7,
      title: 'Solo',
      location: null,
      department: null,
      updatedAt: null,
    });
  });

  it('tolerates the authenticated field names (department/publishedAt)', () => {
    const out = extractListings(
      [{ id: 9, title: 'Auth', department: 'Sales', publishedAt: '2026-05-01T00:00:00Z' }],
      3,
    );
    expect(out[0].department).toBe('Sales');
    expect(out[0].updatedAt).toBe('2026-05-01T00:00:00Z');
  });
});

describe('gateBoard', () => {
  it('returns a Survivor when the board holds >= MIN_JOBS title-bearing jobs', () => {
    const s = gateBoard('acme', board(MIN_JOBS));
    expect(s).not.toBeNull();
    expect(s?.slug).toBe('acme');
    expect(s?.boardName).toBe(''); // Ashby exposes no board name
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
    const payload = {
      jobs: Array.from({ length: MIN_JOBS + 2 }, (_, i) => ({ id: i, title: '   ' })),
    };
    expect(gateBoard('acme', payload)).toBeNull();
  });

  it('rejects a null / job-less payload', () => {
    expect(gateBoard('acme', null)).toBeNull();
    expect(gateBoard('acme', {})).toBeNull();
    expect(gateBoard('acme', { jobs: 'nope' })).toBeNull();
  });

  it('honours a custom minJobs threshold', () => {
    expect(gateBoard('acme', board(4), 5)).toBeNull();
    expect(gateBoard('acme', board(6), 5)).not.toBeNull();
  });
});
