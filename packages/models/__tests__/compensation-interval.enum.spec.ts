import {
  CompensationInterval,
  getCompensationInterval,
} from '../src/enums/compensation-interval.enum';

describe('getCompensationInterval', () => {
  it('maps existing interval tokens case-insensitively', () => {
    expect(getCompensationInterval('YEAR')).toBe(CompensationInterval.YEARLY);
    expect(getCompensationInterval('year')).toBe(CompensationInterval.YEARLY);
    expect(getCompensationInterval('Yearly')).toBe(CompensationInterval.YEARLY);
    expect(getCompensationInterval('month')).toBe(CompensationInterval.MONTHLY);
    expect(getCompensationInterval('HOUR')).toBe(CompensationInterval.HOURLY);
  });

  it('maps only count-one interval unit tokens', () => {
    expect(getCompensationInterval('1 YEAR')).toBe(CompensationInterval.YEARLY);
    expect(getCompensationInterval('1 year')).toBe(CompensationInterval.YEARLY);
    expect(getCompensationInterval(' 1 Month ')).toBe(CompensationInterval.MONTHLY);
    expect(getCompensationInterval('1 HOUR')).toBe(CompensationInterval.HOURLY);
  });

  it('does not drop arbitrary leading digits or plural count units', () => {
    expect(getCompensationInterval('2 weeks')).toBeNull();
    expect(getCompensationInterval('3 MONTHS')).toBeNull();
    expect(getCompensationInterval('1 years')).toBeNull();
    expect(getCompensationInterval('NONE')).toBeNull();
  });
});
