# Tasks — Spec 975: Ashby Company-Source Pipeline

- [x] T1 — Write `scripts/probe-ashby-company-source.ts` (public Ashby Posting
  API probe; pure `gateBoard`/`extractListings` helpers). ✔
- [x] T2 — Write `scripts/__tests__/probe-ashby-company-source.spec.ts`
  (11 tests; no live network). ✔ 11/11 green.
- [x] T3 — Write `scripts/scaffold-ashby-company-source.ts` (pure file emitter;
  parametrised allencontrolsystems delegation pattern + fixture + generic test
  + `.specify` spec). ✔
- [x] T4 — Confirm the batch descriptor is field-compatible with the existing
  backend-agnostic `scripts/wire-company-source.ts`. ✔
- [x] T5 — End-to-end smoke validation (scaffold → wire → jest 9/9 → revert). ✔
- [x] T6 — Document the pipeline (this spec/plan/tasks) + `docs/index.md`,
  `docs/log.md`, `docs/questions.md` (Q-ASHBY-1, Q-ASHBY-2). ✔
- [x] T7 — Discover + verify a first Ashby company batch across sectors,
  assemble descriptors, scaffold + wire, land green. ✔ **218 plugins**
  (Specs 976–1193) landed run #441: 270 discovered → 229 unique → 222 survived
  the live gate → 4 collision-rejected → 218 scaffolded + wired; `tsc` clean,
  **1962 unit tests green**.
- [ ] T8 — (Future) Promote the inline assembly into a dedicated
  `scripts/assemble-ashby-company-batch.ts` mirroring `assemble-company-batch.ts`.
- [ ] T9 — (Future) Optional authenticated-verification step to flip `verified`.
