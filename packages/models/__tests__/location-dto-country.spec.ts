import { Country } from '../src/enums/country.enum';
import { LocationDto } from '../src/dtos/location.dto';

describe('LocationDto country canonicalization', () => {
  it('canonicalizes a raw alpha-2 token and preserves it in text', () => {
    const loc = new LocationDto({ country: 'us' });
    expect(loc.country).toBe('United States');
    expect(loc.text).toBe('us');
  });

  it('canonicalizes alpha-3 and mixed-case tokens', () => {
    expect(new LocationDto({ country: 'USA' }).country).toBe('United States');
    expect(new LocationDto({ country: 'uk' }).country).toBe('United Kingdom');
    expect(new LocationDto({ country: 'PL' }).country).toBe('Poland');
  });

  it('canonicalizes Country enum members (string enums are strings)', () => {
    const loc = new LocationDto({ country: Country.USA });
    expect(loc.country).toBe('United States');
    expect(loc.text).toBe('USA');
    expect(loc.displayLocation()).toBe('United States');
  });

  it('leaves an already-canonical value untouched and does not write text', () => {
    const loc = new LocationDto({ country: 'United States' });
    expect(loc.country).toBe('United States');
    expect(loc.text).toBeUndefined();
  });

  it('never overwrites a text label set by the caller', () => {
    const loc = new LocationDto({
      city: 'Denver',
      state: 'CO',
      country: 'US',
      text: 'Denver, CO, US',
    });
    expect(loc.country).toBe('United States');
    expect(loc.text).toBe('Denver, CO, US');
    expect(loc.displayLocation()).toBe('Denver, CO, United States');
  });

  it('keeps unresolvable values verbatim', () => {
    const loc = new LocationDto({ country: 'XyzNotACountry' });
    expect(loc.country).toBe('XyzNotACountry');
    expect(loc.text).toBeUndefined();
  });

  it('does not canonicalize pseudo-country enum sentinels', () => {
    for (const sentinel of [Country.WORLDWIDE, Country.US_CANADA]) {
      const loc = new LocationDto({ country: sentinel });
      expect(loc.country).toBe(sentinel);
      expect(loc.text).toBeUndefined();
    }
  });

  it('resolves the korea alias', () => {
    expect(new LocationDto({ country: 'Korea' }).country).toBe('South Korea');
  });
});
