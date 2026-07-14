# Tasks — Spec 1677: Workable Company-Source Pipeline

- [x] T1 — `probe-workable-company-source.ts` with pure `gateBoard`/`extractListings`/`boardUrl` + bounded-concurrency probe.
- [x] T2 — Probe unit suite `scripts/__tests__/probe-workable-company-source.spec.ts` (21 tests, no live network). ✔ 21/21 green.
- [x] T3 — `scaffold-workable-company-source.ts` pure file emitter (package + spec/plan/tasks), delegating to `Site.WORKABLE`, re-stamping `workable-`→`<slug>-`.
- [x] T4 — `assemble-workable-batch.ts` descriptor assembler (survivors + enrichment → batch; collision-safe).
- [x] T5 — Confirm `wire-company-source.ts` is reused unchanged (descriptor field-compatible).
- [x] T6 — End-to-end smoke (assemble → scaffold → wire → jest green).
- [ ] T7 — (Ongoing) land Workable company-plugin batches under Specs 1678+ each run.
