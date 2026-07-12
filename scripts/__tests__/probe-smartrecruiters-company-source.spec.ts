/**
 * Unit tests for `scripts/probe-smartrecruiters-company-source.ts`.
 *
 * The probe's network layer (`probeOne`/`getJson`) is intentionally NOT
 * exercised here — these tests pin the pure, deterministic decision surface
 * (`gateBoard`, `extractListings`) that decides whether a SmartRecruiters
 * company board candidate survives the discovery gate and how its postings are
 * normalised.
 *
 * The public SmartRecruiters Posting API returns a JSON **envelope**
 * `{ offset, limit, totalFound, content: [...] }`, so the fixtures here wrap the
 * postings in a `content` array. Each posting exposes `company.name`, so — unlike
 * the Lever/Ashby probes — a real board display name is captured on the wire.
 */
import {
  gateBoard,
  extractListings,
  MIN_JOBS,
} from '../probe-smartrecruiters-company-source';

/**
 * Public SmartRecruiters posting envelope with `n` title-bearing jobs.
 * Locations are supplied as structured city/region/country objects.
 */
function board(n: number): unknown {
  return {
    offset: 0,
    limit: 100,
    totalFound: n,
    content: Array.from({ length: n }, (_, i) => ({
      id: `744000${i}`,
      name: ` Role ${i} `, // padded — exercises the trim
      location: {
        city: 'Austin',
        region: 'TX',
        country: 'us',
        remote: false,
        fullLocation: ` Austin, TX, United States `,
      },
      department: { label: ` Eng ${i} ` },
      company: { name: ' Acme Corp ', identifier: 'AcmeCorp' },
      releasedDate: '2026-06-24T10:00:11.853Z',
    })),
  };
}

describe('extractListings', () => {
  it('normalises the first `limit` jobs and trims padded strings', () => {
    const out = extractListings(board(5), 3);
    expect(out).toHaveLength(3);
    expect(out[0].title).toBe('Role 0');
    expect(out[0].location).toBe('Austin, TX, United States');
    expect(out[0].department).toBe('Eng 0');
    expect(out[0].id).toBe('7440000');
    expect(out[0].updatedAt).toBe('2026-06-24T10:00:11.853Z');
  });

  it('skips jobs with an empty title', () => {
    const raw = {
      content: [
        { id: 1, name: '   ' },
        { id: 2, name: 'Real' },
      ],
    };
    const out = extractListings(raw, 5);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Real');
  });

  it('returns [] for non-object / missing-content input', () => {
    expect(extractListings(null, 3)).toEqual([]);
    expect(extractListings({}, 3)).toEqual([]);
    expect(extractListings({ content: 'nope' }, 3)).toEqual([]);
    expect(extractListings([], 3)).toEqual([]);
  });

  it('null-coalesces missing nested location/department fields', () => {
    const out = extractListings({ content: [{ id: 7, name: 'Solo' }] }, 3);
    expect(out[0]).toMatchObject({
      id: 7,
      title: 'Solo',
      location: null,
      department: null,
      updatedAt: null,
    });
  });

  it('composes city/region/country when fullLocation is absent', () => {
    const out = extractListings(
      {
        content: [
          {
            id: 9,
            name: 'Composed',
            location: { city: 'Berlin', region: 'BE', country: 'de' },
          },
        ],
      },
      3,
    );
    expect(out[0].location).toBe('Berlin, BE, de');
  });

  it('flags Remote when only the remote flag is set', () => {
    const out = extractListings(
      { content: [{ id: 2, name: 'R', location: { remote: true } }] },
      3,
    );
    expect(out[0].location).toBe('Remote');
  });

  it('falls back to function.label when department is absent', () => {
    const out = extractListings(
      { content: [{ id: 3, name: 'T', function: { label: 'Engineering' } }] },
      3,
    );
    expect(out[0].department).toBe('Engineering');
  });

  it('null-coalesces a missing releasedDate', () => {
    const out = extractListings({ content: [{ id: 4, name: 'No date' }] }, 3);
    expect(out[0].updatedAt).toBeNull();
  });
});

describe('gateBoard', () => {
  it('returns a Survivor when the board holds >= MIN_JOBS title-bearing jobs', () => {
    const s = gateBoard('acmecorp', board(MIN_JOBS));
    expect(s).not.toBeNull();
    expect(s?.slug).toBe('acmecorp');
    expect(s?.boardName).toBe('Acme Corp'); // captured from company.name
    expect(s?.jobCount).toBe(MIN_JOBS);
    expect(s?.listings).toHaveLength(3);
  });

  it('caps the seeded listings at 3 even when jobCount is larger', () => {
    const s = gateBoard('acmecorp', board(25));
    expect(s?.jobCount).toBe(25);
    expect(s?.listings).toHaveLength(3);
  });

  it('rejects a board below MIN_JOBS', () => {
    expect(gateBoard('acmecorp', board(MIN_JOBS - 1))).toBeNull();
  });

  it('rejects a board whose jobs lack real titles even if content is long', () => {
    const payload = {
      content: Array.from({ length: MIN_JOBS + 2 }, (_, i) => ({
        id: i,
        name: '   ',
      })),
    };
    expect(gateBoard('acmecorp', payload)).toBeNull();
  });

  it('rejects a null / non-envelope payload', () => {
    expect(gateBoard('acmecorp', null)).toBeNull();
    expect(gateBoard('acmecorp', {})).toBeNull();
    expect(gateBoard('acmecorp', { content: 'nope' })).toBeNull();
    expect(gateBoard('acmecorp', [])).toBeNull();
  });

  it('leaves boardName empty when company.name is absent', () => {
    const payload = {
      content: Array.from({ length: MIN_JOBS }, (_, i) => ({
        id: i,
        name: `Role ${i}`,
      })),
    };
    const s = gateBoard('acmecorp', payload);
    expect(s).not.toBeNull();
    expect(s?.boardName).toBe('');
  });

  it('honours a custom minJobs threshold', () => {
    expect(gateBoard('acmecorp', board(4), 5)).toBeNull();
    expect(gateBoard('acmecorp', board(6), 5)).not.toBeNull();
  });
});
