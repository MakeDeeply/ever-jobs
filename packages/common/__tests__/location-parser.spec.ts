import { parseLocationList, parseLocationText } from '../src';

describe('parseLocationText', () => {
  it('splits a plain US city and state label', () => {
    const parsed = parseLocationText('  Atlanta,   GA  ');

    expect(parsed).toMatchObject({
      location: { city: 'Atlanta', state: 'GA' },
      remoteMentioned: false,
      workFromHomeType: null,
    });
  });

  it('normalizes lowercase postal codes', () => {
    expect(parseLocationText('Atlanta, ga').location).toMatchObject({
      city: 'Atlanta',
      state: 'GA',
    });
  });

  it('accepts US territories and military postal regions', () => {
    expect(parseLocationText('San Juan, PR').location).toMatchObject({
      city: 'San Juan',
      state: 'PR',
    });
    expect(parseLocationText('APO, AE').location).toMatchObject({
      city: 'APO',
      state: 'AE',
    });
  });

  it.each([
    ['Atlanta, GA (Hybrid)', false, 'Hybrid'],
    ['(REMOTE) Atlanta, ga', true, 'Remote'],
    ['Atlanta, GA (hybrid and/or REMOTE)', true, 'Hybrid or Remote'],
    ['hybrid / Atlanta, GA', false, 'Hybrid'],
    ['(hYbRiD) / Atlanta, GA', false, 'Hybrid'],
    ['Atlanta, GA / remote', true, 'Remote'],
    ['REMOTE / Atlanta, GA / HYBRID', true, 'Hybrid or Remote'],
  ] as const)(
    'extracts flexible workplace qualifiers from %s',
    (raw, remoteMentioned, workFromHomeType) => {
      expect(parseLocationText(raw)).toMatchObject({
        location: { city: 'Atlanta', state: 'GA' },
        remoteMentioned,
        workFromHomeType,
      });
    },
  );

  it('maps unrecognized subdivisions verbatim into state and site descriptors into name', () => {
    expect(
      parseLocationText('Atlanta, GA (Headquarters)').location,
    ).toMatchObject({ city: 'Atlanta', state: 'GA', name: 'Headquarters' });
    // 'ON' is not a US state or ISO country -> verbatim subdivision
    expect(parseLocationText('Toronto, ON').location).toMatchObject({
      city: 'Toronto',
      state: 'ON',
    });
  });

  it('splits a remote-qualified location and retains its workplace meaning', () => {
    const parsed = parseLocationText('Remote / Atlanta, GA');

    expect(parsed.location).toMatchObject({ city: 'Atlanta', state: 'GA' });
    expect(parsed.remoteMentioned).toBe(true);
    expect(parsed.workFromHomeType).toBe('Remote');
  });

  it('returns no location for empty input', () => {
    expect(parseLocationText('   ')).toEqual({
      location: null,
      remoteMentioned: false,
      workFromHomeType: null,
    });
    expect(parseLocationText(null)).toEqual({
      location: null,
      remoteMentioned: false,
      workFromHomeType: null,
    });
  });
});

describe('parseLocationList', () => {
  it('deduplicates equivalent US city/state/country labels and preserves remote signal', () => {
    const parsed = parseLocationList([
      'Mountain View, CA',
      'Mountain View, California, United States',
      'Seattle, WA',
      'Seattle, WA, United States',
      'Remote',
      'United States',
    ]);

    expect(parsed.labels).toEqual([
      'Mountain View, CA, United States',
      'Seattle, WA, United States',
      'United States',
    ]);
    expect(parsed.locations).toHaveLength(3);
    expect(parsed.locations[0]).toMatchObject({
      city: 'Mountain View',
      state: 'CA',
      country: 'United States',
    });
    expect(parsed.locations[1]).toMatchObject({
      city: 'Seattle',
      state: 'WA',
      country: 'United States',
    });
    expect(parsed.locations[2]).toMatchObject({ country: 'United States' });
    expect(parsed.location).toMatchObject({
      city: 'Mountain View, California; Seattle, WA',
      country: 'United States',
    });
    expect(parsed.remoteMentioned).toBe(true);
    expect(parsed.workFromHomeType).toBe('Remote');
  });

  it('stamps the sole literal country on the merged view when nothing conflicts', () => {
    const parsed = parseLocationList(['United States', 'Austin, TX']);

    expect(parsed.labels).toEqual(['United States', 'Austin, TX']);
    expect(parsed.location).toMatchObject({
      city: 'Austin, TX',
      country: 'United States',
    });
  });

  it('collapses a bare city when a structured city/state form is present', () => {
    const parsed = parseLocationList([
      'Los Angeles',
      'Los Angeles, California, USA',
    ]);

    expect(parsed.labels).toEqual(['Los Angeles, CA, United States']);
    expect(parsed.location).toMatchObject({
      city: 'Los Angeles',
      state: 'CA',
      country: 'United States',
    });
  });

  it('never mints a Remote city — qualifiers live in flags only', () => {
    const parsed = parseLocationList(['Remote', 'United States']);

    expect(parsed.locations).toEqual([
      expect.objectContaining({ country: 'United States' }),
    ]);
    expect(parsed.location).toMatchObject({ country: 'United States' });
    expect(parsed.location?.city).toBeUndefined();
    expect(parsed.remoteMentioned).toBe(true);
    expect(parsed.workFromHomeType).toBe('Remote');
  });

  it('splits slash-separated multi-site strings into per-site entries', () => {
    const parsed = parseLocationList(['Toronto, ON', 'Atlanta / Savannah, GA']);

    expect(parsed.labels).toEqual(['Toronto, ON', 'Atlanta', 'Savannah, GA']);
    expect(parsed.locations[0]).toMatchObject({
      city: 'Toronto',
      state: 'ON',
    });
    expect(parsed.locations[2]).toMatchObject({
      city: 'Savannah',
      state: 'GA',
    });
  });
});

describe('LocationDto.text', () => {
  it('omits text when the label is trivially regenerable from fields', () => {
    const parsed = parseLocationList([
      'Seattle, WA',
      'Berlin, Germany',
      ' Bengaluru  ',
    ]);

    expect(parsed.locations.map((loc) => loc.text)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
    expect(parsed.locations[0]).toMatchObject({ city: 'Seattle', state: 'WA' });
    expect(parsed.locations[1]).toMatchObject({
      city: 'Berlin',
      country: 'Germany',
    });
    expect(parsed.locations[2]).toMatchObject({ city: 'Bengaluru' });
  });

  it('records the verbatim label when fields cannot regenerate it', () => {
    const parsed = parseLocationList([
      'Austin, TX - Atlas',
      'Remote United States',
    ]);

    expect(parsed.locations[0]).toMatchObject({
      city: 'Austin',
      state: 'TX',
      name: 'Atlas',
      text: 'Austin, TX - Atlas',
    });
    expect(parsed.locations[1]).toMatchObject({
      country: 'United States',
      text: 'Remote United States',
    });
  });

  it('omits text on the merged multi-site location, which is synthesized not raw', () => {
    const parsed = parseLocationList(['Seattle, WA', 'Austin, TX']);

    expect(parsed.location).toMatchObject({
      city: 'Seattle, WA; Austin, TX',
    });
    expect(parsed.location?.text).toBeUndefined();
  });

  it('omits text on a remote-only or country-only location, which has no site label', () => {
    expect(
      parseLocationList(['Remote', 'United States']).location?.text,
    ).toBeUndefined();
    expect(
      parseLocationList(['United States']).location?.text,
    ).toBeUndefined();
  });
});

describe('allowBareStateProvince (default on)', () => {
  it('resolves a bare US state name/code to state by default', () => {
    expect(parseLocationText('Virginia').location).toMatchObject({
      state: 'VA',
    });
    expect(parseLocationText('VA').location).toMatchObject({ state: 'VA' });
    expect(parseLocationList(['Virginia']).location).toMatchObject({
      state: 'VA',
    });
  });

  it('keeps a bare state name in city when a caller opts out', () => {
    expect(
      parseLocationText('Virginia', { allowBareStateProvince: false }).location,
    ).toMatchObject({ city: 'Virginia' });
    expect(
      parseLocationText('VA', { allowBareStateProvince: false }).location?.state,
    ).toBeUndefined();
  });

  it('never resolves collision names (Washington, New York, Georgia) to state', () => {
    for (const name of ['Washington', 'New York', 'Georgia']) {
      expect(parseLocationText(name).location).toMatchObject({ city: name });
    }
  });

  it('leaves a City, ST pair unchanged (no regression)', () => {
    expect(parseLocationText('Richmond, VA').location).toMatchObject({
      city: 'Richmond',
      state: 'VA',
    });
  });

  it('does not promote a non-state token', () => {
    expect(parseLocationText('Springfield').location).toMatchObject({
      city: 'Springfield',
    });
    expect(parseLocationText('Ontario').location).toMatchObject({
      city: 'Ontario',
    });
  });
});

describe('US subdivision recognition (spec 5130)', () => {
  it('resolves a state name in the city slot of "Name, Country"', () => {
    expect(parseLocationText('Arizona, USA').location).toMatchObject({
      state: 'AZ',
      country: 'United States',
    });
  });

  it('keeps collision names in the city slot ("New York, USA")', () => {
    expect(parseLocationText('New York, USA').location).toMatchObject({
      city: 'New York',
      country: 'United States',
    });
    expect(parseLocationText('New York, USA').location?.state).toBeUndefined();
  });

  it('emits territory names verbatim as state, not codes', () => {
    expect(parseLocationText('Puerto Rico, USA').location).toMatchObject({
      state: 'Puerto Rico',
      country: 'United States',
    });
    expect(parseLocationText('Puerto Rico').location).toMatchObject({
      state: 'Puerto Rico',
    });
    expect(parseLocationText('X, Puerto Rico').location).toMatchObject({
      city: 'X',
      state: 'Puerto Rico',
    });
  });

  it('normalizes dotted state codes (D.C., N.Y.)', () => {
    expect(parseLocationText('Washington, D.C').location).toMatchObject({
      city: 'Washington',
      state: 'DC',
    });
    expect(parseLocationText('Washington, D.C.').location).toMatchObject({
      city: 'Washington',
      state: 'DC',
    });
    expect(parseLocationText('Albany, N.Y.').location).toMatchObject({
      city: 'Albany',
      state: 'NY',
    });
  });

  it('splits an unseparated "City ST" label', () => {
    expect(parseLocationText('Bristol RI').location).toMatchObject({
      city: 'Bristol',
      state: 'RI',
    });
    expect(parseLocationText('San Juan PR').location).toMatchObject({
      city: 'San Juan',
      state: 'PR',
    });
    expect(parseLocationText('Washington D.C').location).toMatchObject({
      city: 'Washington',
      state: 'DC',
    });
  });

  it('splits "City ST" inside a comma pair with a country', () => {
    expect(parseLocationText('Bristol RI, USA').location).toMatchObject({
      city: 'Bristol',
      state: 'RI',
      country: 'United States',
    });
  });

  it('splits a comma-packed pair ending in a dotted code into two sites', () => {
    const parsed = parseLocationList(['Bristol, RI, Washington, D.C']);

    expect(parsed.locations).toHaveLength(2);
    expect(parsed.locations[0]).toMatchObject({
      city: 'Bristol',
      state: 'RI',
    });
    expect(parsed.locations[1]).toMatchObject({
      city: 'Washington',
      state: 'DC',
    });
  });

  it('does not split a bare label whose tail is not a US code', () => {
    expect(parseLocationText('Little Rock').location).toMatchObject({
      city: 'Little Rock',
    });
  });
});

describe('dash-prefixed US-state sites (spec 5131)', () => {
  it('parses a spaced ST - City prefix', () => {
    expect(parseLocationText('MA - Boston').location).toMatchObject({
      city: 'Boston',
      state: 'MA',
    });
  });

  it('parses an unspaced ST-City prefix', () => {
    expect(parseLocationText('MA-Boston').location).toMatchObject({
      city: 'Boston',
      state: 'MA',
    });
  });

  it('does not stamp a country on a solo ST - street site', () => {
    const loc = parseLocationText('MD - Gaither Rd.').location;
    expect(loc).toMatchObject({ state: 'MD', name: 'Gaither Rd.' });
    expect(loc?.country).toBeUndefined();
  });

  it('does not stamp a country on an unspaced ST-street site', () => {
    const loc = parseLocationText('MD-Gaither Rd.').location;
    expect(loc).toMatchObject({ state: 'MD', name: 'Gaither Rd.' });
    expect(loc?.country).toBeUndefined();
  });

  it('splits ST - street, City <descriptor>', () => {
    expect(
      parseLocationText('MD - Gaither Rd., Rockville Corp Hqtrs').location,
    ).toMatchObject({
      city: 'Rockville',
      state: 'MD',
      name: 'Gaither Rd. - Corp Hqtrs',
    });
  });

  it('keeps a ST - City as city and demotes the descriptor part to name', () => {
    expect(
      parseLocationText('MA - Boston, Rockville Corp Hqtrs').location,
    ).toMatchObject({
      city: 'Boston',
      state: 'MA',
      name: 'Rockville Corp Hqtrs',
    });
    expect(
      parseLocationText('MA-Boston, Rockville Corp Hqtrs').location,
    ).toMatchObject({
      city: 'Boston',
      state: 'MA',
      name: 'Rockville Corp Hqtrs',
    });
  });

  it('splits ST - street, City', () => {
    expect(
      parseLocationText('MD - Gaither Rd., Rockville').location,
    ).toMatchObject({
      city: 'Rockville',
      state: 'MD',
      name: 'Gaither Rd.',
    });
  });

  it('pops a literal country tail after a ST - site', () => {
    expect(
      parseLocationText('MD - Gaither Rd., Rockville, United States').location,
    ).toMatchObject({
      city: 'Rockville',
      state: 'MD',
      name: 'Gaither Rd.',
      country: 'United States',
    });
  });

  it('keeps a bare City <descriptor> as city without a ST - prefix', () => {
    expect(parseLocationText('Rockville Corp Hqtrs').location).toMatchObject({
      city: 'Rockville Corp Hqtrs',
    });
  });

  it('keeps a pure descriptor part as name after ST - City', () => {
    expect(parseLocationText('MA - Boston, Corp Hqtrs').location).toMatchObject(
      {
        city: 'Boston',
        state: 'MA',
        name: 'Corp Hqtrs',
      },
    );
  });

  it('does not read comma-tail subdivision codes as street suffixes', () => {
    expect(parseLocationText('Warsaw, PL').location).toMatchObject({
      city: 'Warsaw',
      country: 'Poland',
    });
  });

  it('keeps hyphenates and non-US dash prefixes whole', () => {
    expect(parseLocationText('CO-OP').location).toMatchObject({
      city: 'CO-OP',
    });
    expect(parseLocationText('T-Mobile').location).toMatchObject({
      city: 'T-Mobile',
    });
    expect(parseLocationText('MD - Remote').location).toMatchObject({
      state: 'MD',
    });
    expect(parseLocationText('ON - Toronto').location).toMatchObject({
      city: 'ON',
      name: 'Toronto',
    });
  });
});
