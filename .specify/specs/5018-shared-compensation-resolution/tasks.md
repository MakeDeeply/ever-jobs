# Tasks: 5018 — Shared structured-first compensation resolution

- [x] T01 — Add `compensationFromSalary`, `salaryToCompensation`, `resolveCompensation` to `@ever-jobs/common`.
- [x] T02 — Add common-package unit tests for the three helpers.
- [x] T03 — Wire ashby description fallback via `resolveCompensation`.
- [x] T04 — Wire greenhouse description fallback (entity-decoded content).
- [x] T05 — Wire lever description fallback (`descriptionPlain ?? description`).
- [x] T06 — Wire workable text-only compensation via `salaryToCompensation`.
- [x] T07 — Refactor rippling text branch onto the shared helper (per-band `salarySource` unchanged).
- [x] T08 — Refactor workday onto the shared helper.
- [x] T09 — Refactor breezyhr onto the shared helper.
- [x] T10 — Refactor bamboohr onto the shared helper.
- [x] T11 — Add/extend collocated plugin tests (structured-wins / text-fallback / null) for the four newly-wired plugins.
- [x] T12 — Run build, docs lint, and affected jest suites; update docs index + log.
