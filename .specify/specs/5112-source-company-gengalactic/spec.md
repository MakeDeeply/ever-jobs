# Spec 5112 — Source Company Plugin: General Galactic (`source-company-gengalactic`)

| Field | Value |
|---|---|
| Spec | 5112 |
| Slug | `source-company-gengalactic` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-03 |
| Last updated | 2026-09-03 |
| Related specs | 5069 (domain-to-token rule), 5111 (recent company plugin) |

## Problem

General Galactic (`gengalactic.com`) hosts its careers page at `https://gengalactic.com/careers.html` on a static Webflow site. The listing contains 22 job cards, each linking to `/careers/<slug>`; detail pages contain the role description inside `div.article.w-richtext` and a `mailto:careers@gengalactic.com` apply path. No recognized ATS was detected, so a dedicated `source-company-*` plugin is required to harvest it.

## Scope

- Add `packages/plugins/source-company-gengalactic` package.
- Parse the static listing page with `HttpClient` + Cheerio, then follow each `/careers/<slug>` detail page to retrieve the full description.
- Extract title, location, employment type, description, and apply email.
- Map results to `JobPostDto` with `site: Site.GENGALACTIC` and `companyDomains: ['gengalactic.com']`.
- Register the plugin in `site.enum.ts`, `packages/plugins/index.ts`, `tsconfig.base.json`, and `jest.config.js`.
- Add a unit test with mocked `HttpClient` response fixtures.
- Update `docs/index.md` and `docs/log.md`.

## Non-Goals

- No `BrowserPool` rendering is needed; listing and detail pages are static Webflow HTML.
- No parsing of the resume-submission form beyond the `mailto:` apply address.
- No support for additional hosts unless they are verified company aliases.

## Acceptance Criteria

- `npx tsc --noEmit -p packages/plugins/source-company-gengalactic/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- `npx jest --testPathPatterns gengalactic` passes.
- `npm run lint:docs` is clean.

## Design

### HTTP fetch

`GengalacticService.scrape()` uses `createHttpClient()` from `@ever-jobs/common` to GET the listing page at `https://gengalactic.com/careers.html` (or `input.companyUrl` if provided). It parses each job card, then fetches the linked detail page for each role with bounded concurrency (`p-limit` or `Promise.allSettled`) to collect the full description.

### Listing-page parsing

Each job card is an `<a href="/careers/<slug>">` containing:

- `<div class="career-link-title">` — job title.
- `<div class="career-link-meta">` with:
  - `<div class="badge-text career-location">` — location (e.g. `El Segundo, CA`).
  - a second `<div class="badge-text">` — employment type (e.g. `Full Time`), possibly empty.

The service iterates over `a[href^="/careers/"]` elements that contain a `.career-link-title`, extracts the title, location, and employment type, and collects the detail href.

### Detail-page parsing

The detail page (`/careers/<slug>`) contains:

- `<h1 class="display-heading">` — the role title.
- `<h2 class="heading-h5">` — the location.
- `<div class="article w-richtext">` — the full role description.
- `mailto:info@gengalactic.com` in the footer; the listing page exposes the apply path `careers@gengalactic.com`.

### Field mapping

- `id`: `gengalactic-${slugify(title)}`.
- `site`: `Site.GENGALACTIC`.
- `companyName`: `'General Galactic'`.
- `companyUrl`: `https://gengalactic.com/careers.html` or `input.companyUrl`.
- `jobUrl`: absolute detail page URL (`https://gengalactic.com/careers/<slug>`).
- `jobUrlDirect`: same as `jobUrl`.
- `applyUrl`: `mailto:careers@gengalactic.com`.
- `emails`: `['careers@gengalactic.com']`.
- `location`: parsed from the `.career-location` text (`El Segundo, CA` → `LocationDto` with `country: Country.USA`).
- `jobType`: `[JobType.FULL_TIME]` by default; derived from the employment token and title.
- `employmentType`: human-readable token (`Full time`, `Internship`, etc.).
- `isRemote`: `false` unless a `remote` token is present.
- `workFromHomeType`: `'On Site'` / `'Remote'` / `'Hybrid'` / `null`.
- `description`: plain-text content of `div.article.w-richtext`.

### Filtering

`applyInput()` supports `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted`.

## Files

- `packages/plugins/source-company-gengalactic/package.json`
- `packages/plugins/source-company-gengalactic/tsconfig.json`
- `packages/plugins/source-company-gengalactic/src/index.ts`
- `packages/plugins/source-company-gengalactic/src/gengalactic.module.ts`
- `packages/plugins/source-company-gengalactic/src/gengalactic.service.ts`
- `packages/plugins/source-company-gengalactic/src/gengalactic.constants.ts`
- `packages/plugins/source-company-gengalactic/__tests__/gengalactic.service.spec.ts`
- `packages/plugins/source-company-gengalactic/__tests__/fixtures/careers.html`
- `packages/plugins/source-company-gengalactic/__tests__/fixtures/electric-propulsion-test-engineer.html`
- `packages/models/src/enums/site.enum.ts`
- `packages/plugins/index.ts`
- `tsconfig.base.json`
- `jest.config.js`
- `docs/index.md`
- `docs/log.md`
