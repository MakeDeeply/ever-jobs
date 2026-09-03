# Plan: 5095 — Resolve mixed `companyDomain` / `siteType` routing in `JobsService`

## Phases

### Phase 1 — Spec
- Create Spec Kit 5095 (`spec.md`, `plan.md`, `tasks.md`) under `.specify/specs/5095-jobs-service-companydomain-routing/`.

### Phase 2 — Core implementation
- Update `apps/api/src/jobs/jobs.service.ts`:
  - Refactor `resolveCompanyDomains` to return `{ resolved: Set<Site>, unresolved: string[] }`.
  - Move the `BadRequestException` logic into `searchJobsWithDiagnostics`, throwing only when `effectiveSites` is empty.
  - Append `SourceDiagnosticDto` rows for `companyDomain` values that did not map to a registered `Site` token to `perSource` when the request proceeds.

### Phase 3 — Tests
- Extend `apps/api/src/jobs/__tests__/jobs.service.spec.ts`:
  - Mixed `siteType` + `companyDomain` with no matching `Site` token proceeds with a diagnostic.
  - `companyDomain` with no matching `Site` token alone still throws `BadRequestException`.
  - Mixed `siteType` + `companyDomain` with no matching `Site` token + empty entries.
  - `companyDomain` mixed (valid + no matching `Site` token) + valid `siteType`.

### Phase 4 — Docs & hygiene
- Update `docs/index.md` with spec 5095 row.
- Update `docs/log.md` with changelog entry.
- Run `npx tsc --noEmit -p apps/api/tsconfig.json`.
- Run `npx jest --testPathPatterns jobs.service`.
- Commit, push `devin/5095-jobs-service-companydomain-routing`, and open PR to `develop`.

## Risks

| Risk                                             | Mitigation                                                 |
| ------------------------------------------------ | ---------------------------------------------------------- |
| Diagnostic rows with `site: 'companyDomain:...'` may surprise consumers | `perSource` is a diagnostic list; the prefix makes the source non-existent by design. |
| Existing tests assert the exact `BadRequestException` message | Preserve message format; update only the test that needs the mixed case. |
| Default routing changes if the empty-`effectiveSites` branch is touched | Keep the `effectiveSites.length === 0` condition and fall through to the existing `else if (input.companySlug)` / `else` branches unchanged. |

## Packages touched

- `apps/api` (`jobs.service.ts`, `jobs.service.spec.ts`)
- `docs/index.md`, `docs/log.md`
