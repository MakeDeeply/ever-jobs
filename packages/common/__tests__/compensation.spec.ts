import {
  aggregateCompensation,
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

describe('aggregateCompensation (Spec 5019)', () => {
  it('folds many tiers into an overall min-max envelope', () => {
    const comp = aggregateCompensation([
      { minAmount: 180000, maxAmount: 220000, currency: 'USD', interval: CompensationInterval.YEARLY },
      { minAmount: 170000, maxAmount: 210000, currency: 'USD', interval: CompensationInterval.YEARLY },
      { minAmount: 150000, maxAmount: 190000, currency: 'USD', interval: CompensationInterval.YEARLY },
    ]);
    expect(comp?.minAmount).toBe(150000);
    expect(comp?.maxAmount).toBe(220000);
    expect(comp?.currency).toBe('USD');
    expect(comp?.interval).toBe(CompensationInterval.YEARLY);
  });

  it('returns a plain single-tier range unchanged', () => {
    const comp = aggregateCompensation([
      { minAmount: 120000, maxAmount: 160000, currency: 'USD', interval: CompensationInterval.YEARLY },
    ]);
    expect(comp?.minAmount).toBe(120000);
    expect(comp?.maxAmount).toBe(160000);
  });

  it('only folds bands sharing the first bounded band currency and interval', () => {
    const comp = aggregateCompensation([
      { minAmount: 180000, maxAmount: 220000, currency: 'USD', interval: CompensationInterval.YEARLY },
      { minAmount: 50, maxAmount: 70, currency: 'USD', interval: CompensationInterval.HOURLY },
      { minAmount: 160000, maxAmount: 240000, currency: 'EUR', interval: CompensationInterval.YEARLY },
    ]);
    expect(comp?.minAmount).toBe(180000);
    expect(comp?.maxAmount).toBe(220000);
    expect(comp?.currency).toBe('USD');
    expect(comp?.interval).toBe(CompensationInterval.YEARLY);
  });

  it('keeps a one-sided band (floor only, ceiling only)', () => {
    const comp = aggregateCompensation([
      { minAmount: 100000, maxAmount: null, currency: 'USD', interval: CompensationInterval.YEARLY },
      { minAmount: null, maxAmount: 200000, currency: 'USD', interval: CompensationInterval.YEARLY },
    ]);
    expect(comp?.minAmount).toBe(100000);
    expect(comp?.maxAmount).toBe(200000);
  });

  it('ignores unbounded bands and returns null when none are bounded', () => {
    expect(aggregateCompensation([])).toBeNull();
    expect(
      aggregateCompensation([
        { minAmount: null, maxAmount: null, currency: 'USD' },
        null,
        undefined,
      ]),
    ).toBeNull();
  });
});
