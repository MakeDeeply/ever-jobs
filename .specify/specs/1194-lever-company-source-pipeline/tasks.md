# Tasks — Spec 1194: Lever Company-Source Pipeline

## Foundation (run #442)

- [x] T1 — `scripts/probe-lever-company-source.ts` — deterministic public
  Postings-API probe; pure `gateBoard` / `extractListings`; bounded-concurrency
  worker pool; bare-array wire shape.
- [x] T2 — `scripts/__tests__/probe-lever-company-source.spec.ts` — 13 unit
  tests (extractListings normalisation/trim/fallbacks; gateBoard count gate,
  seed cap, custom threshold). Green, no live network.
- [x] T3 — `scripts/scaffold-lever-company-source.ts` — pure file emitter for the
  full `source-company-<slug>` package (module, service, index, mocked test,
  bare-array Lever fixture) + `.specify` spec/plan/tasks. Delegates to
  `Site.LEVER` via the registry; `lever-`→`<slug>-` id rewrite.
- [x] T4 — Confirm `scripts/wire-company-source.ts` is backend-agnostic and
  reused unchanged (descriptor field-compatible).
- [x] T5 — End-to-end smoke test (scaffold throwaway → wire → jest green →
  revert). Proves emitter + generated test + wiring.
- [x] T6 — Author this spec/plan/tasks + record Q-LEVER-1 / Q-LEVER-2.

## First batch (Specs 1195+)

- [ ] T7 — Discover Lever-hosted companies across sectors (parallel workflow,
  self-verified ≥3 live roles).
- [ ] T8 — Central re-probe through `probe-lever-company-source.ts` (authoritative
  gate); dedup against the corpus; collision-check enumKey/className/value.
- [ ] T9 — Scaffold + wire the survivors; `tsc --noEmit` + generated unit suites
  green; commit + push; CI green.
