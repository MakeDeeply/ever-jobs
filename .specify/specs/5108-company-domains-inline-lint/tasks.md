# Tasks — Spec 5108: `companyDomains` Inline-Array Lint & Checklist

> Status legend: `[ ]` pending • `[~]` in-progress • `[x]` done • `[-]` dropped

## Phase 1 — Lint test

- [x] T01 — Add `scripts/__tests__/company-domains-inline.spec.ts` that scans `source-company-*/src/*.service.ts`.
  - **Files:** `scripts/__tests__/company-domains-inline.spec.ts`
  - **Acceptance:** Fails on `companyDomains: CONSTANT`, non-string entries, and `www.` prefixes; passes for inline quoted-string arrays; includes temp-repo unit tests.
  - **Estimate:** 0.5 day

## Phase 2 — Fix existing violation

- [x] T02 — Inline `companyDomains` in `source-company-shinkei_systems` and remove `SHINKEI_SYSTEMS_DOMAINS`.
  - **Files:** `packages/plugins/source-company-shinkei_systems/src/shinkei_systems.service.ts`, `packages/plugins/source-company-shinkei_systems/src/shinkei_systems.constants.ts`
  - **Acceptance:** The lint passes for this plugin; existing unit tests still pass.
  - **Estimate:** 0.25 day

## Phase 3 — Spec Kit checklist

- [x] T03 — Update `.specify/templates/tasks.template.md` with a `companyDomains` inline-array reminder.
  - **Files:** `.specify/templates/tasks.template.md`
  - **Acceptance:** Template contains the reminder verbatim.
  - **Estimate:** 0.1 day

## Phase 4 — Docs & validation

- [x] T04 — Add Spec 5108 to `docs/index.md` and append to `docs/log.md`.
  - **Files:** `docs/index.md`, `docs/log.md`
  - **Acceptance:** `npm run lint:docs` passes.
  - **Estimate:** 0.1 day

- [x] T05 — Run focused tests and typecheck.
  - **Acceptance:** `npx jest --testPathPatterns company-domains-inline` passes; `npx jest --testPathPatterns shinkei_systems` passes; `npx tsc --noEmit -p apps/api/tsconfig.json` clean; `npm run lint:docs` clean.
  - **Estimate:** 0.25 day

## Phase 5 — Commit & PR

- [~] T06 — Commit, push, and open a PR.
  - **Acceptance:** Branch pushed to origin; PR opened against `develop`.
  - **Estimate:** 0.1 day
