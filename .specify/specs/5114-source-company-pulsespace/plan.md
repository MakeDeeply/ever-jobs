# Plan — Spec 5114 — Source Company Plugin: Pulse Space

| Field | Value |
|---|---|
| Spec | 5114 |
| Slug | `source-company-pulsespace` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-03 |
| Last updated | 2026-09-03 |

## Phase 1: Spec Kit

- Create `.specify/specs/5114-source-company-pulsespace/{spec,plan,tasks}.md`.
- Append Spec 5114 row to `docs/index.md` and prepend entry to `docs/log.md`.

## Phase 2: Package scaffold

- `packages/plugins/source-company-pulsespace/package.json`
- `packages/plugins/source-company-pulsespace/tsconfig.json`
- `src/index.ts`, `src/pulsespace.module.ts`, `src/pulsespace.constants.ts`

## Phase 3: Plugin implementation

- `src/pulsespace.service.ts`
  - GET `https://pulsespace.com/careers` (or `input.companyUrl`).
  - Parse the listing `<ul>` for `/careers/<slug>` links.
  - Fetch each detail page with bounded `Promise.allSettled` concurrency.
  - Extract title, location, employment type, department, and description.
  - Map to `JobPostDto` with `applyUrl` intentionally omitted.
  - Apply standard filters.

## Phase 4: Registration

- `packages/models/src/enums/site.enum.ts` — add `PULSESPACE = 'pulsespace'`.
- `packages/plugins/index.ts` — import/export `PulsespaceModule`.
- `tsconfig.base.json` — add `@ever-jobs/source-company-pulsespace` path.
- `jest.config.js` — add matching `moduleNameMapper` entry.

## Phase 5: Tests

- `__tests__/fixtures/careers.html` — sanitized listing with the 5 open roles.
- `__tests__/fixtures/principal-avionics-architect.html` — sanitized detail page.
- `__tests__/pulsespace.service.spec.ts` — mock `HttpClient`, assert title, site, companyName, `companyDomains`, location, job type, employment type, department, description, blank `applyUrl`, filters, and empty list.

## Phase 6: Validation

- `npx tsc --noEmit -p packages/plugins/source-company-pulsespace/tsconfig.json`
- `npx tsc --noEmit -p apps/api/tsconfig.json`
- `npx jest --testPathPatterns pulsespace`
- `npm run lint:docs`

## Phase 7: PR

- Commit, push `devin/source-company-pulsespace-5114`.
- Open PR against `develop`, explicitly mentioning `companyDomains: ['pulsespace.com']` and that `applyUrl` is intentionally blank.
