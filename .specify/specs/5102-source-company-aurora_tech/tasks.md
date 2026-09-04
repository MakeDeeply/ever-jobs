# Tasks: 5102 — Source Company Plugin: Aurora (rename and Ashby migration)

- [x] T1 — Create Spec Kit 5102 (`spec.md`, `plan.md`, `tasks.md`). Acceptance: files present and follow existing format.
- [x] T2 — Rename `packages/plugins/source-company-aurorainnovation` to `source-company-aurora_tech` and update `package.json` / source file names. Acceptance: git recognizes a move and package compiles.
- [x] T3 — Update `Site` enum, `packages/plugins/index.ts`, `tsconfig.base.json`, and `jest.config.js` to use `aurora_tech`. Acceptance: no remaining references to `aurorainnovation` outside `.specify/specs/790` and `docs/` history.
- [x] T4 — Implement `AuroraTechService` against the Ashby public API. Acceptance: calls `aurora-operations-inc`, maps jobs to `JobPostDto` with `site: Site.AURORA_TECH`.
- [x] T5 — Write `__tests__/auroratech.service.spec.ts` and fixture. Acceptance: tests cover site, company name, id prefix, filters, and compensation.
- [x] T6 — Run `npx tsc --noEmit` for plugin and `apps/api`, and `npx jest --testPathPatterns aurora_tech`. Acceptance: clean typecheck and passing tests.
- [x] T7 — Update `docs/index.md` and `docs/log.md`. Acceptance: index links work and log entry is append-only.
- [x] T8 — Commit, push, and open PR. Acceptance: PR description is concise and external-audience safe.
