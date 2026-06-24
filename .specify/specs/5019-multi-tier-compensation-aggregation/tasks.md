# Tasks: 5019 — Multi-tier compensation aggregation

- [x] T01 — Add `CompensationRange` + `aggregateCompensation` to `@ever-jobs/common`.
- [x] T02 — Add common-package unit tests for the aggregator (fold, single-band, currency+interval guard, one-sided, empty→null).
- [x] T03 — Refactor ashby tiered path to fold all tiers via `aggregateCompensation`.
- [x] T04 — Refactor ashby flat path to fold all same-type salary bands via `aggregateCompensation`.
- [x] T05 — Refactor rippling `extractCompensation` onto `aggregateCompensation` (per-band `salarySource` unchanged).
- [x] T06 — Add ashby multi-tier fixtures (tiered SF/NYC/remote; flat multi-band + equity).
- [x] T07 — Add rippling 3+ band fixture with a mismatched-currency band excluded.
- [x] T08 — Run build, docs lint, and affected jest suites; keep prior fixtures green; update docs index + log.
