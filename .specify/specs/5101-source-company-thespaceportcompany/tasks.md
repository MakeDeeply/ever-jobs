# Tasks: 5101 — Source Company Plugin: The Spaceport Company

- [x] T1 — Create Spec Kit 5101 (`spec.md`, `plan.md`, `tasks.md`). Acceptance: files present and follow existing format.
- [x] T2 — Scaffold `packages/plugins/source-company-thespaceportcompany` package with `package.json` and `tsconfig.json`. Acceptance: package compiles.
- [x] T3 — Implement `src/thespaceportcompany.constants.ts`, `module.ts`, and `index.ts`. Acceptance: constants exported.
- [x] T4 — Implement `TheSpaceportcompanyService` scraper. Acceptance: parses the fixture into `JobPostDto` objects.
- [x] T5 — Register the plugin in `site.enum.ts`, `packages/plugins/index.ts`, `tsconfig.base.json`, and `jest.config.js`. Acceptance: imports resolve and app typechecks.
- [x] T6 — Write `__tests__/thespaceportcompany.service.spec.ts` and `__tests__/fixtures/careers.html`. Acceptance: tests assert 2 visible jobs and no hidden drafts.
- [x] T7 — Update `docs/index.md` and `docs/log.md`. Acceptance: no broken links.
- [x] T8 — Run `npx tsc --noEmit` for the new package and `apps/api`. Acceptance: clean.
- [x] T9 — Run `npx jest --testPathPatterns thespaceportcompany`. Acceptance: all tests pass.
- [x] T10 — Commit, push, and open PR. Acceptance: PR description follows the concise external-audience format.
