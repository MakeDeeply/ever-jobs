# Tasks — Spec 1593: Recruitee Company-Source Pipeline

- [x] T1 — `scripts/probe-recruitee-company-source.ts` with pure `gateBoard`, `extractListings`, `boardUrl` + bounded-concurrency live pool.
- [x] T2 — `scripts/__tests__/probe-recruitee-company-source.spec.ts` — 19 unit tests, no live network. **Green.**
- [x] T3 — `scripts/scaffold-recruitee-company-source.ts` — pure emitter (package + spec/plan/tasks), delegates to `Site.RECRUITEE`, re-stamps `recruitee-`→`<slug>-`.
- [x] T4 — `scripts/assemble-recruitee-batch.ts` — collision-safe descriptor assembler (survivors + enrichment + spec range).
- [x] T5 — Confirm live endpoint shape (`channable`, `sendcloud`) — HTTP 200, `{ offers: [...] }`.
- [x] T6 — End-to-end smoke: scaffold throwaway → wire → jest generated plugin → revert; `git status` clean.
- [ ] T7 — First real batch (Specs 1594+) assembled, scaffolded, wired, tested (run #444).
