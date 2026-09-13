# Spec 5113 — Source Company Plugin: HLabs (`source-company-hlaboratories`)

| Field | Value |
|---|---|
| Spec | 5113 |
| Slug | `source-company-hlaboratories` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-07 |
| Last updated | 2026-09-07 |
| Related specs | 5069 (domain-to-token rule) |

## Problem

HLabs (`hlaboratories.com`) exposes its open roles through a public, unauthenticated, company-hosted JSON API at `https://hlaboratories.com/api/recruitment/roles?open_only=true`. The response is a custom schema (not a recognized ATS), so a dedicated `source-company-*` plugin is required to harvest it. The `/jobs` page is a React/SPA accordion that loads from the same API, so `HttpClient` can read the API directly without `BrowserPool`.

## Scope

- Add `packages/plugins/source-company-hlaboratories` package.
- Fetch `https://hlaboratories.com/api/recruitment/roles?open_only=true` (or the API path relative to `input.companyUrl`) with `createHttpClient`.
- Parse each role object into a `JobPostDto`.
- Map `companyDomains: ['hlaboratories.com']` inline in the `@SourcePlugin()` decorator.
- Register the plugin in `site.enum.ts`, `packages/plugins/index.ts`, `tsconfig.base.json`, and `jest.config.js`.
- Add unit tests with a mocked JSON fixture covering two sample roles (`General Application`, `Robotics Engineer`).
- Update `docs/index.md` and `docs/log.md`.

## Non-Goals

- No `BrowserPool` rendering; the API is the source of truth.
- No application submission logic; the plugin is read-only.
- No parsing of `salary_min`/`salary_max` (both are null in the current payload).

## Acceptance Criteria

- `npx tsc --noEmit -p packages/plugins/source-company-hlaboratories/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- `npx jest --testPathPatterns hlaboratories` passes.
- `npm run lint:docs` is clean.

## Design

### HTTP fetch

`HlaboratoriesService.fetchJobs()` uses `createHttpClient()` to GET the roles endpoint. The base origin is derived from `input.companyUrl` (default `https://hlaboratories.com`) so callers can pass a test host. The fixed path is `/api/recruitment/roles?open_only=true`.

The response is parsed with `JSON.parse` and expected to be an array of role objects:

```ts
interface HlaboratoriesRole {
  id: number;
  title: string;
  department: string | null;
  location: string;
  employment_type: string; // e.g. "full_time"
  remote: boolean;
  description: string;
  requirements: string;
  salary_min: number | null;
  salary_max: number | null;
  is_open: boolean;
  created_at: string;
  closed_at: string | null;
  application_count: number;
}
```

### Field mapping

- `id`: `hlaboratories-${role.id}`.
- `site`: `Site.HLABORATORIES` (`'hlaboratories'`).
- `title`: `role.title`.
- `companyName`: `'HLabs'`.
- `companyUrl`: `https://hlaboratories.com` (or derived origin).
- `jobUrl`: `https://hlaboratories.com/jobs` (public careers page; the SPA shows the role).
- `applyUrl`: same as `jobUrl` because the application form lives on the `/jobs` page.
- `description`: `role.description` + `\n\n## Requirements\n\n` + `role.requirements`, converted to plain text.
- `location`: parsed from `role.location` (e.g. `Austin, TX` → `city: Austin`, `state: TX`, `country: USA`).
- `jobType`: derived from `role.employment_type` (`full_time` → `[JobType.FULL_TIME]`).
- `employmentType`: human-readable label (`Full time`).
- `isRemote`: `role.remote`.
- `workFromHomeType`: `'Remote'` when `role.remote === true`, otherwise `'On Site'`.
- `datePosted`: `role.created_at` parsed to date-only.
- `department`: `role.department`.

Roles with `is_open === false` or missing `title` are skipped.

### Filtering

`applyInput()` supports `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted`.

## Files

- `packages/plugins/source-company-hlaboratories/package.json`
- `packages/plugins/source-company-hlaboratories/tsconfig.json`
- `packages/plugins/source-company-hlaboratories/src/index.ts`
- `packages/plugins/source-company-hlaboratories/src/hlaboratories.module.ts`
- `packages/plugins/source-company-hlaboratories/src/hlaboratories.service.ts`
- `packages/plugins/source-company-hlaboratories/src/hlaboratories.constants.ts`
- `packages/plugins/source-company-hlaboratories/__tests__/hlaboratories.service.spec.ts`
- `packages/plugins/source-company-hlaboratories/__tests__/fixtures/roles.json`
- `packages/models/src/enums/site.enum.ts`
- `packages/plugins/index.ts`
- `tsconfig.base.json`
- `jest.config.js`
- `docs/index.md`
- `docs/log.md`
