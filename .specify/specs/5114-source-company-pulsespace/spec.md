# Spec 5114 — Source Company Plugin: Pulse Space (`source-company-pulsespace`)

| Field | Value |
|---|---|
| Spec | 5114 |
| Slug | `source-company-pulsespace` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-03 |
| Last updated | 2026-09-03 |
| Related specs | 5069 (domain-to-token rule) |

## Problem

Pulse Space (`pulsespace.com`) hosts its careers page at `https://pulsespace.com/careers` with detail pages at `https://pulsespace.com/careers/<slug>`. The pages are server-rendered React/Next.js and contain no recognizable ATS or apply link (no apply button, `mailto`, or external form). A dedicated `source-company-*` plugin is needed to harvest the open roles.

## Scope

- Add `packages/plugins/source-company-pulsespace` package.
- Fetch `https://pulsespace.com/careers` with `createHttpClient` and parse the SSR `<ul>` of `<a href="/careers/<slug>">` links.
- For each role, fetch `https://pulsespace.com/careers/<slug>` with bounded `Promise.allSettled` concurrency.
- Extract title from `<h1>`; location, employment type, and department from the three metadata `<span>`s; description by concatenating the `<h2>` sections.
- Map to `JobPostDto` with `id = pulsespace-${slug}`, `companyName = 'Pulse Space'`, `companyUrl = https://pulsespace.com`, `jobUrl` = detail page URL.
- Leave `applyUrl` blank (the page has no visible application path).
- `companyDomains: ['pulsespace.com']` inline in `@SourcePlugin()`.
- Register in `site.enum.ts`, `packages/plugins/index.ts`, `tsconfig.base.json`, and `jest.config.js`.
- Add unit tests with fixtures for the listing and one detail page.

## Non-Goals

- No `BrowserPool` rendering; SSR HTML is sufficient.
- No fabricated `applyUrl`.
- No application submission logic.

## Acceptance Criteria

- `npx tsc --noEmit -p packages/plugins/source-company-pulsespace/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- `npx jest --testPathPatterns pulsespace` passes.
- `npm run lint:docs` is clean.

## Design

### HTTP fetch

`PulsespaceService.fetchJobs()` uses `createHttpClient()` to GET the listing page. It parses `<a href="/careers/<slug>">` links inside `<main>` (or `<body>`), builds a `ListingRecord` per role, and batches detail-page fetches with `Promise.allSettled` limited by `PULSESPACE_DETAIL_CONCURRENCY`.

### Detail-page extraction

Detail pages contain a single `<h1>` title, a metadata `<div>` with three `<span>` elements (location, employment type, department), and a sequence of `<div>` sections each with an `<h2>` heading. The description is built by walking the `<h2>` sections and concatenating heading + body text.

### Field mapping

- `id`: `pulsespace-${slug}` derived from the listing href.
- `site`: `Site.PULSESPACE` (`'pulsespace'`).
- `title`: detail `<h1>` text, falling back to listing link text.
- `companyName`: `'Pulse Space'`.
- `companyUrl`: `https://pulsespace.com` (or `input.companyUrl` origin).
- `jobUrl`/`jobUrlDirect`: absolute detail page URL.
- `applyUrl`: omitted / blank.
- `department`: the third metadata span, e.g. `Engineering / Avionics Systems`.
- `location`: parsed from the location span (`Seattle, WA` → city/state/USA).
- `jobType`: derived from the employment type span (`Full-Time` → `[JobType.FULL_TIME]`).
- `employmentType`: human-readable label (`Full time`).
- `isRemote`/`workFromHomeType`: derived from location and employment text (no remote tokens means `isRemote: false`, `workFromHomeType: null`).
- `description`: concatenated `<h2>` sections.

### Filtering

`applyInput()` supports `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted`.

## Files

- `packages/plugins/source-company-pulsespace/package.json`
- `packages/plugins/source-company-pulsespace/tsconfig.json`
- `packages/plugins/source-company-pulsespace/src/index.ts`
- `packages/plugins/source-company-pulsespace/src/pulsespace.module.ts`
- `packages/plugins/source-company-pulsespace/src/pulsespace.service.ts`
- `packages/plugins/source-company-pulsespace/src/pulsespace.constants.ts`
- `packages/plugins/source-company-pulsespace/__tests__/pulsespace.service.spec.ts`
- `packages/plugins/source-company-pulsespace/__tests__/fixtures/careers.html`
- `packages/plugins/source-company-pulsespace/__tests__/fixtures/principal-avionics-architect.html`
- `packages/models/src/enums/site.enum.ts`
- `packages/plugins/index.ts`
- `tsconfig.base.json`
- `jest.config.js`
- `docs/index.md`
- `docs/log.md`
