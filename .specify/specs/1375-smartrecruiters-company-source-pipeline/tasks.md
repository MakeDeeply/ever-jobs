# Tasks — Spec 1375: SmartRecruiters Company-Source Pipeline

- [x] T1 — Confirm the `source-ats-smartrecruiters` backend contract (`companySlug`
      input, `sr-` id prefix, `{ content: [...] }` envelope, structured fields).
- [x] T2 — Write `scripts/probe-smartrecruiters-company-source.ts` (pure
      `gateBoard`/`extractListings` + bounded-concurrency live probe).
- [x] T3 — Write `scripts/__tests__/probe-smartrecruiters-company-source.spec.ts`
      (15 unit tests, no live network). ✔ 15/15 green.
- [x] T4 — Write `scripts/scaffold-smartrecruiters-company-source.ts` (pure
      per-descriptor emitter; delegates to `Site.SMARTRECRUITERS`).
- [x] T5 — Confirm `scripts/wire-company-source.ts` is reusable unchanged
      (descriptor field-compatible).
- [x] T6 — End-to-end smoke test: scaffold → wire → jest (9/9) → full revert,
      `git status` clean.
- [x] T7 — Land the first real SmartRecruiters company batch (Specs 1376+).
- [ ] T8 — (Optional) authenticated live verification harness for large batches.
