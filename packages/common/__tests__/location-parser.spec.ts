import { parseLocationText } from '../src';

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

  it('preserves unrecognized and unsafe labels without losing data', () => {
    expect(parseLocationText('Atlanta, GA (Headquarters)').location).toMatchObject({
      city: 'Atlanta, GA (Headquarters)',
    });
    expect(parseLocationText('Toronto, ON').location).toMatchObject({
      city: 'Toronto, ON',
    });
    expect(parseLocationText('Atlanta / Savannah, GA').location).toMatchObject({
      city: 'Atlanta / Savannah, GA',
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
