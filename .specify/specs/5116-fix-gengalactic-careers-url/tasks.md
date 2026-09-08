# Tasks: 5116 — Fix General Galactic Careers URL

> Status legend: `[ ]` pending • `[~]` in-progress • `[x]` done • `[-]` dropped

## Phase 1 — Fix constant and tests

- [x] T01 — Update `GENGALACTIC_CAREERS_URL` to `https://gengalactic.com/careers`
  - **Files:** `packages/plugins/source-company-gengalactic/src/gengalactic.constants.ts`
  - **Acceptance:** `GENGALACTIC_CAREERS_URL` ends with `/careers` and `tsc --noEmit` for the package is clean.
  - **Estimate:** 0.1 day

- [x] T02 — Update gengalactic unit-test mock and assertion
  - **Files:** `packages/plugins/source-company-gengalactic/__tests__/gengalactic.service.spec.ts`
  - **Acceptance:** `mockBothFixtures` matches `https://gengalactic.com/careers`; `companyUrl` assertion checks the same URL; `npx jest --testPathPatterns gengalactic` passes.
  - **Estimate:** 0.1 day

## Phase 2 — Docs and validation

- [x] T03 — Index Spec 5116 in `docs/index.md` and `docs/log.md`
  - **Files:** `docs/index.md`, `docs/log.md`
  - **Acceptance:** `npm run lint:docs` is clean.
  - **Estimate:** 0.1 day

- [x] T04 — Open PR against `origin/develop`
  - **Files:** (branch)
  - **Acceptance:** PR created with conventional title and concise description; CI `Source Scrapers` and `Build & Type-Check` pass.
  - **Estimate:** 0.1 day

## Notes

- Do not modify `fetch1` logic or mention it in commits/PR.
- Keep the custom-`companyUrl` test unchanged; it validates caller-provided URLs.
