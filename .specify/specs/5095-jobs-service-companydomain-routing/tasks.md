# Tasks: 5095 — Resolve mixed `companyDomain` / `siteType` routing in `JobsService`

- [x] T01 — Write Spec Kit 5095 (`spec.md`, `plan.md`, `tasks.md`) under `.specify/specs/5095-jobs-service-companydomain-routing/`
- [x] T02 — Refactor `resolveCompanyDomains` in `apps/api/src/jobs/jobs.service.ts` to return `{ resolved, unresolved }`
- [x] T03 — Update `searchJobsWithDiagnostics` to throw `BadRequestException` only when `effectiveSites` is empty
- [x] T04 — Add `bad_input` `SourceDiagnosticDto` rows for `companyDomain` values that did not map to a registered `Site` token when the request proceeds
- [x] T05 — Extend `apps/api/src/jobs/__tests__/jobs.service.spec.ts` with mixed `companyDomain` + `siteType` cases
- [x] T06 — Update `docs/index.md` with Spec 5095 row
- [x] T07 — Update `docs/log.md` with changelog entry
- [x] T08 — Run `npx tsc --noEmit -p apps/api/tsconfig.json`
- [x] T09 — Run `npx jest --testPathPatterns jobs.service`
- [x] T10 — Commit, push `devin/5095-jobs-service-companydomain-routing`, and open PR to `develop`
