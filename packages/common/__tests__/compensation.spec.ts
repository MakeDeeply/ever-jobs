import {
  compensationFromSalary,
  resolveCompensation,
  salaryToCompensation,
  type ExtractSalaryResult,
} from '@ever-jobs/common';
import { CompensationDto, CompensationInterval } from '@ever-jobs/models';

describe('compensationFromSalary (Spec 5018)', () => {
  it('maps a bounded yearly range to a CompensationDto', () => {
    const parsed: ExtractSalaryResult = {
      interval: 'YEAR',
      minAmount: 120000,
      maxAmount: 160000,
      currency: 'USD',
    };
    expect(compensationFromSalary(parsed)).toEqual(
      new CompensationDto({
        interval: CompensationInterval.YEARLY,
        minAmount: 120000,
        maxAmount: 160000,
        currency: 'USD',
      }),
    );
  });

  it('returns null when neither bound is present', () => {
    const parsed: ExtractSalaryResult = {
      interval: 'YEAR',
      minAmount: null,
      maxAmount: null,
      currency: 'USD',
    };
    expect(compensationFromSalary(parsed)).toBeNull();
  });

  it('keeps a single bound and leaves interval null when unparseable', () => {
    const parsed: ExtractSalaryResult = {
      interval: null,
      minAmount: null,
      maxAmount: 90000,
      currency: 'EUR',
    };
    const comp = compensationFromSalary(parsed);
    expect(comp?.minAmount).toBeUndefined();
    expect(comp?.maxAmount).toBe(90000);
    expect(comp?.interval).toBeUndefined();
    expect(comp?.currency).toBe('EUR');
  });

  it('defaults a missing currency to USD via CompensationDto', () => {
    const parsed: ExtractSalaryResult = {
      interval: 'HOUR',
      minAmount: 40,
      maxAmount: 55,
      currency: null,
    };
    const comp = compensationFromSalary(parsed);
    expect(comp?.currency).toBe('USD');
    expect(comp?.interval).toBe(CompensationInterval.HOURLY);
  });
});

describe('salaryToCompensation (Spec 5018)', () => {
  it('returns null for empty or whitespace input', () => {
    expect(salaryToCompensation(null)).toBeNull();
    expect(salaryToCompensation(undefined)).toBeNull();
    expect(salaryToCompensation('   ')).toBeNull();
  });

  it('returns null for prose without a salary range', () => {
    expect(
      salaryToCompensation('Requires 5-7 years of relevant experience.'),
    ).toBeNull();
  });

  it('parses a salary range stated in free text', () => {
    const comp = salaryToCompensation(
      'The base salary range for this role is $120,000 - $160,000 per year.',
    );
    expect(comp?.minAmount).toBe(120000);
    expect(comp?.maxAmount).toBe(160000);
    expect(comp?.currency).toBe('USD');
  });
});

describe('resolveCompensation (Spec 5018)', () => {
  const structured = new CompensationDto({
    interval: CompensationInterval.YEARLY,
    minAmount: 200000,
    maxAmount: 250000,
    currency: 'GBP',
  });

  it('returns the structured value and ignores text when structured is present', () => {
    const comp = resolveCompensation({
      structured,
      text: 'Base salary $120,000 - $160,000 per year.',
    });
    expect(comp).toBe(structured);
  });

  it('falls back to parsing text when structured is absent', () => {
    const comp = resolveCompensation({
      structured: null,
      text: 'Base salary $120,000 - $160,000 per year.',
    });
    expect(comp?.minAmount).toBe(120000);
    expect(comp?.maxAmount).toBe(160000);
  });

  it('returns null when neither structured nor parseable text is present', () => {
    expect(
      resolveCompensation({ structured: null, text: 'No pay listed here.' }),
    ).toBeNull();
    expect(resolveCompensation({})).toBeNull();
  });
});
