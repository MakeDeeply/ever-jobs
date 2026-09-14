# Spec 5115 — Source Company Plugin: ReNEW Manufacturing Solutions (`source-company-renewmfgsol`)

| Field | Value |
|---|---|
| Spec | 5115 |
| Slug | `source-company-renewmfgsol` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-07 |
| Last updated | 2026-09-07 |
| Related specs | 5069 (domain-to-token rule) |

## Problem

ReNEW Manufacturing Solutions (`renewmfgsol.com`) hosts its careers content on a HubSpot page at `https://www.renewmfgsol.com/about/work-with-us`. The page exposes two open roles (`Welder` and `CNC Machinist`) as `div.atmc-career-01` cards, each with a title, location, and an apply button. The apply button for `Welder` links to an internal landing page (`/hiring-welders-ga`); the `CNC Machinist` button links to an external Adzuna aggregator. A dedicated `source-company-*` plugin is needed to harvest the roles.

## Scope

- Add `packages/plugins/source-company-renewmfgsol` package.
- Fetch `https://www.renewmfgsol.com/about/work-with-us` with `createHttpClient` and parse the SSR HubSpot cards.
- Extract `title` from each `h4`, `location` from the sibling `p.atmc-cap`, and `applyUrl` from the card's `a.atmc-btn`.
- Resolve apply links to absolute URLs.
- For internal apply links, fetch the landing page and parse a description from `meta[property="og:description"]` or `meta[name="description"]` (falling back to `#main-content` rich text).
- For external apply links, store the external URL and skip detail fetching.
- Map to `JobPostDto` with `id = renewmfgsol-${slugify(title)}`, `companyName = 'ReNEW Manufacturing Solutions'`, `companyUrl = https://www.renewmfgsol.com`, and `jobUrl`/`jobUrlDirect` pointing to the internal landing page or the listing page.
- `companyDomains: ['renewmfgsol.com']` inline in `@SourcePlugin()`.
- Register in `site.enum.ts`, `packages/plugins/index.ts`, `tsconfig.base.json`, and `jest.config.js`.
- Add unit tests with fixtures for the listing and one internal detail page.

## Non-Goals

- No `BrowserPool` rendering; the SSR HTML contains the cards and apply links.
- No scraping of the external Adzuna aggregator.
- No application submission logic.

## Acceptance Criteria

- `npx tsc --noEmit -p packages/plugins/source-company-renewmfgsol/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- `npx jest --testPathPatterns renewmfgsol` passes.
- `npm run lint:docs` is clean.

## Design

### HTTP fetch

`RenewmfgsolService.fetchJobs()` uses `createHttpClient()` to GET the listing page. It iterates each `div.atmc-career-01_box`, reads the title, location, and apply href, and builds a `ListingRecord` per card.

### Detail fetch

Internal apply URLs (same origin as the listing) are fetched with bounded `Promise.allSettled` concurrency (`RENEWMFGSOL_DETAIL_CONCURRENCY = 2`). External Adzuna URLs are not followed.

### Field mapping

- `id`: `renewmfgsol-${slugify(title)}`.
- `site`: `Site.RENEWMFGSOL` (`'renewmfgsol'`).
- `title`: card heading (`h4`).
- `companyName`: `'ReNEW Manufacturing Solutions'`.
- `companyUrl`: `https://www.renewmfgsol.com` (or `input.companyUrl` origin).
- `jobUrl`/`jobUrlDirect`: internal detail page for `Welder`; listing page for the external `CNC Machinist` role.
- `applyUrl`: resolved apply href.
- `location`: parsed from the `City, ST` token (`Dalton, GA`, `Leander, TX`).
- `jobType`: defaults to `[JobType.FULL_TIME]` unless tokens indicate otherwise.
- `employmentType`: human-readable label derived from `jobType`.
- `isRemote`/`workFromHomeType`: no remote tokens in the source, so `isRemote: false`, `workFromHomeType: null`.
- `description`: parsed from the internal detail page meta description or rich text; empty for the external Adzuna role.

### Filtering

`applyInput()` supports `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted`.

## Files

- `packages/plugins/source-company-renewmfgsol/package.json`
- `packages/plugins/source-company-renewmfgsol/tsconfig.json`
- `packages/plugins/source-company-renewmfgsol/src/index.ts`
- `packages/plugins/source-company-renewmfgsol/src/renewmfgsol.module.ts`
- `packages/plugins/source-company-renewmfgsol/src/renewmfgsol.service.ts`
- `packages/plugins/source-company-renewmfgsol/src/renewmfgsol.constants.ts`
- `packages/plugins/source-company-renewmfgsol/__tests__/renewmfgsol.service.spec.ts`
- `packages/plugins/source-company-renewmfgsol/__tests__/fixtures/work-with-us.html`
- `packages/plugins/source-company-renewmfgsol/__tests__/fixtures/hiring-welders-ga.html`
- `packages/models/src/enums/site.enum.ts`
- `packages/plugins/index.ts`
- `tsconfig.base.json`
- `jest.config.js`
- `docs/index.md`
- `docs/log.md`
