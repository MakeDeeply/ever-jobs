# Plan — Spec 5113 — Source Company Plugin: HLabs

| Field | Value |
|---|---|
| Spec | 5113 |
| Slug | `source-company-hlaboratories` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-07 |
| Last updated | 2026-09-07 |

## Phase 1: Spec Kit

- Create `.specify/specs/5113-source-company-hlaboratories/{spec,plan,tasks}.md`.
- Add entry to `docs/index.md` and `docs/log.md`.

## Phase 2: Package scaffold

- `packages/plugins/source-company-hlaboratories/package.json`
- `packages/plugins/source-company-hlaboratories/tsconfig.json`
- `src/index.ts`, `src/hlaboratories.module.ts`, `src/hlaboratories.constants.ts`

## Phase 3: Plugin implementation

- `src/hlaboratories.service.ts`
  - GET `/api/recruitment/roles?open_only=true` relative to the configured origin.
  - Validate JSON array; skip closed or title-less roles.
  - Map each role to `JobPostDto` with `id` prefix `hlaboratories-`.
  - Convert description + requirements to plain text.
  - Parse `Austin, TX` style location.
  - Derive `jobType`, `employmentType`, `isRemote`, `workFromHomeType`.
  - Apply standard filters.

## Phase 4: Registration

- `packages/models/src/enums/site.enum.ts` — add `HLABORATORIES = 'hlaboratories'`.
- `packages/plugins/index.ts` — import/export `HlaboratoriesModule`.
- `tsconfig.base.json` — add `@ever-jobs/source-company-hlaboratories` path.
- `jest.config.js` — add `moduleNameMapper` entry.

## Phase 5: Tests

- `__tests__/fixtures/roles.json` — sanitized two-role API payload.
- `__tests__/hlaboratories.service.spec.ts` — mock `HttpClient`, assert title, site, companyName, `companyDomains` reachability via plugin metadata, location, job type, remote flag, filters, and empty list.

## Phase 6: Validation

- `npx tsc --noEmit -p packages/plugins/source-company-hlaboratories/tsconfig.json`
- `npx tsc --noEmit -p apps/api/tsconfig.json`
- `npx jest --testPathPatterns hlaboratories`
- `npm run lint:docs`

## Phase 7: PR

- Commit, push `devin/source-company-hlaboratories-5113`.
- Open PR against `develop`, explicitly mentioning `companyDomains: ['hlaboratories.com']` in the description.
