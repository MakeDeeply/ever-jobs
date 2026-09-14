# Tasks: 5103 — Source Company Plugin: ThinkOrbital

- [x] T1 — Create Spec Kit 5103 (`spec.md`, `plan.md`, `tasks.md`). Acceptance: files present and follow existing format.
- [x] T2 — Scaffold `packages/plugins/source-company-thinkorbital` package. Acceptance: files present and package compiles.
- [x] T3 — Register ThinkOrbital plugin in the four canonical files. Acceptance: no missing references.
- [x] T4 — Implement `ThinkorbitalService` scraper. Acceptance: returns 3 visible jobs, ignores hidden accordion, `applyUrl` unset.
- [x] T5 — Write `__tests__/thinkorbital.service.spec.ts` and fixture. Acceptance: tests cover titles, locations, hidden-role exclusion, filters.
- [x] T6 — Run `npx tsc --noEmit` for plugin and `apps/api`, and `npx jest --testPathPatterns thinkorbital`. Acceptance: clean typecheck and passing tests.
- [x] T7 — Update `docs/index.md` and `docs/log.md`. Acceptance: index links work and log entry is append-only.
- [x] T8 — Commit, push, and open PR. Acceptance: PR description is concise and external-audience safe.
