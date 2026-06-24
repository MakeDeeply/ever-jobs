# Spec: 5019 — Multi-tier compensation aggregation

| Field | Value |
| --- | --- |
| Spec ID | 5019 |
| Slug | multi-tier-compensation-aggregation |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Supersedes | (none) |
| Related specs | 5012 (rippling compensation), 5018 (shared compensation resolution), 5008 (ashby field-name fallbacks) |

## Problem

When an ATS posting lists pay ranges for several tiers (per geography, level, or
work mode), the extractors collapse to a **single** tier rather than the overall
envelope:

1. **ashby, tiered** — picks one base/salary component and reports only
   `tiers[0]`. A posting with SF / NYC / remote tiers loses every band but the
   first.
2. **ashby, flat** — picks one `summaryComponents` / `compensationTiers[].components`
   entry and reports its `minValue`/`maxValue` only.
3. **rippling** — already folds `payRangeDetails[]` into
   `min(rangeStart)…max(rangeEnd)`, but the logic is hand-rolled inline, so the
   rule cannot be shared and can drift from ashby's behaviour.

So a job posting SF $180–220k, NYC $170–210k, remote $150–190k reports an
arbitrary single tier instead of the true overall band $150–220k.

## Scope

- Add one source-neutral helper to `@ever-jobs/common`:
  - `aggregateCompensation(ranges)` — fold many bounded ranges into a single
    `min(floors)…max(ceilings)` envelope, guarded to a single currency+interval
    basis.
- Refactor the plugins that expose multiple bands onto the shared helper:
  **ashby (tiered + flat)** and **rippling** (replace its inline
  `Math.min`/`Math.max` fold).
- Preserve all existing behaviour and fixtures; add multi-tier fixtures proving
  the overall envelope is reported.

## Contract

```ts
export interface CompensationRange {
  minAmount?: number | null;
  maxAmount?: number | null;
  currency?: string | null;
  interval?: CompensationInterval | null;
}

function aggregateCompensation(
  ranges: ReadonlyArray<CompensationRange | null | undefined>,
): CompensationDto | null;
```

- Only ranges with at least one bounded amount (`minAmount` or `maxAmount`)
  contribute; `null`/`undefined`/fully-unbounded entries are ignored.
- The **first bounded range** sets the basis currency + interval. Only ranges
  sharing that currency and interval are folded, so a stray EUR or hourly band
  cannot pollute a USD yearly aggregate.
- Result: `minAmount = min(all in-basis floors)`,
  `maxAmount = max(all in-basis ceilings)`; a one-sided band contributes only the
  side it has. `interval`/`currency` come from the basis.
- Returns `null` when no range carries a bounded amount.

## Files

- `packages/common/src/utils/helpers.ts`
- `packages/common/__tests__/compensation.spec.ts`
- `packages/plugins/source-ats-ashby/src/ashby.service.ts`
- `packages/plugins/source-ats-rippling/src/rippling.service.ts`
- collocated `__tests__` for ashby and rippling

## Non-goals

- Adding multi-tier handling to plugins that only ever expose a single
  structured range (lever, greenhouse) or text-only compensation (workday,
  breezyhr, bamboohr, workable).
- Changing the structured-first / text-fallback precedence from Spec 5018.
- Converting between currencies or intervals to merge mismatched bands — they
  are excluded, never converted.
- Altering the `CompensationDto` shape or its `'USD'` default.

## Test plan

- common: `aggregateCompensation` returns `null` for empty/all-unbounded input;
  folds many same-basis ranges into `min(floors)…max(ceilings)`; returns a single
  range unchanged; folds only ranges matching the first band's currency+interval
  (mixed EUR/hourly excluded); keeps one-sided bands.
- ashby tiered: a base-salary component with SF/NYC/remote tiers reports the
  overall envelope, not `tiers[0]`.
- ashby flat: multiple `Salary` bands report the overall envelope; an
  `EquityPercentage` row stays out.
- rippling: 3+ `payRangeDetails` fold into the overall envelope; a
  mismatched-currency band is ignored. Existing 2-band collapse fixture stays
  green.
- All prior compensation fixtures across the touched plugins stay green.
