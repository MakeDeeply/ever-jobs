# Plan: 5019 — Multi-tier compensation aggregation

| Field | Value |
| --- | --- |
| Spec ID | 5019 |
| Slug | multi-tier-compensation-aggregation |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |

1. Add `CompensationRange` + `aggregateCompensation(ranges)` to `@ever-jobs/common`
    (`utils/helpers.ts`), generalising the `payRangeDetails[]` collapse Rippling
    hand-rolled into a single source of truth.
2. Add common-package unit tests for the aggregator: empty/all-unbounded → null,
    multi-band fold, single-band passthrough, currency+interval guard, one-sided
    bands.
3. Refactor ashby onto the aggregator:
    - tiered path — fold every `tier` of the chosen base/salary component.
    - flat path — fold every component sharing the chosen salary's
      `compensationType` (equity/bonus rows stay out).
4. Refactor rippling `extractCompensation` to call `aggregateCompensation`
    instead of inline `Math.min`/`Math.max`; per-band `salarySource` logic is
    unchanged.
5. Add multi-tier fixtures: ashby tiered (SF/NYC/remote tiers), ashby flat
    (multiple salary bands + an equity row), rippling (3+ bands + a
    mismatched-currency band that must be excluded).
6. Run `npm run build`, `npm run lint:docs`, and the affected jest suites; keep
    every prior fixture green; update docs index + log.

## Risks

- **Behaviour drift on the rippling refactor.** The inline fold and the helper
  must produce identical envelopes. Mitigated by keeping the existing 2-band and
  identical-band fixtures green and matching the same currency-from-first-band
  behaviour.
- **Mixed-unit pollution.** Folding bands of different currency/interval would
  produce nonsense. Mitigated by the basis guard (first bounded band sets
  currency+interval; mismatches are excluded, never converted), covered by a unit
  test and a rippling fixture.
- **Equity/bonus leakage in ashby flat.** Non-salary components must not widen
  the salary envelope. Mitigated by filtering to the chosen salary's
  `compensationType` before folding, covered by the flat multi-band fixture.
