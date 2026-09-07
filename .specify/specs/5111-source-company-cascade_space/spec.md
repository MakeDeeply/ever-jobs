# Spec 5111 — Source Company Plugin: Cascade Space (`source-company-cascade_space`)

| Field | Value |
|---|---|
| Spec | 5111 |
| Slug | `source-company-cascade_space` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-07 |
| Last updated | 2026-09-07 |
| Related specs | 5069 (domain-to-token rule), 5110 (recent company plugin) |

## Problem

Cascade Space (`cascade.space`) hosts its careers page at `https://cascade.space/careers/` on a static/SSR Next.js site. The listing contains one visible card (`Senior Mechanical Engineer`, `FULL-TIME`, `ON-SITE`, `SAN FRANCISCO, CA`) with a detail link to `/careers/mech-e/`. The detail page contains the full role description and an apply-by-email link (`careers@cascade.space`). No recognized ATS was detected, so a dedicated `source-company-*` plugin is required to harvest it.

## Scope

- Add `packages/plugins/source-company-cascade_space` package.
- Parse the static listing page with `HttpClient` + Cheerio, then follow each `/careers/<slug>/` detail page to retrieve the full description.
- Extract title, location, employment type, workplace mode, description, and apply email.
- Map results to `JobPostDto` with `site: Site.CASCADE_SPACE` and `companyDomains: ['cascade.space', 'cascadespace.com']`.
- Register the plugin in `site.enum.ts`, `packages/plugins/index.ts`, `tsconfig.base.json`, and `jest.config.js`.
- Add a unit test with mocked `HttpClient` response fixtures.
- Update `docs/index.md` and `docs/log.md`.

## Non-Goals

- No `BrowserPool` rendering is needed; both listing and detail pages are static.
- No parsing of the resume-submission workflow beyond the `mailto:` apply address.
- No support for additional hosts unless they are verified company aliases.

## Acceptance Criteria

- `npx tsc --noEmit -p packages/plugins/source-company-cascade_space/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- `npx jest --testPathPatterns cascade_space` passes.
- `npm run lint:docs` is clean.

## Design

### HTTP fetch

`CascadeSpaceService.scrape()` uses `createHttpClient()` from `@ever-jobs/common` to GET the listing page at `https://cascade.space/careers/` (or `input.companyUrl` if provided). It parses each job card, then fetches the linked detail page for each role with bounded concurrency (`p-limit` or `Promise.allSettled`) to collect the full description and confirm the apply email.

### Listing-page parsing

Each job card contains:

- `h3` — job title (e.g. `Senior Mechanical Engineer`).
- A sibling `div` with spans — the metadata line, e.g. `FULL-TIME  •  ON-SITE • SAN FRANCISCO, CA`.
- An `a[title="<title>"][href^="/careers/"]` — detail href (e.g. `/careers/mech-e/`).

The service iterates over `h3` elements inside the careers section, validates that a detail link is present, and extracts the title and tagline.

### Detail-page parsing

The detail page (`/careers/<slug>/`) contains:

- `h1` — the role title.
- An `article` element — the full role description (About, The Role, Required Qualifications, etc.).
- A `mailto:careers@cascade.space` link for applications.

### Field mapping

- `id`: `cascade_space-${slugify(title)}`.
- `site`: `Site.CASCADE_SPACE`.
- `companyName`: `'Cascade Space'`.
- `companyUrl`: `https://cascade.space/careers/` or `input.companyUrl`.
- `jobUrl`: absolute detail page URL (`https://cascade.space/careers/<slug>/`).
- `jobUrlDirect`: same as `jobUrl`.
- `applyUrl`: `mailto:careers@cascade.space`.
- `emails`: `['careers@cascade.space']`.
- `location`: parsed from the tagline (`SAN FRANCISCO, CA` → `LocationDto` with `country: Country.USA`).
- `jobType`: `[JobType.FULL_TIME]` by default; derived from the employment token.
- `employmentType`: human-readable token from the tagline (`Full-time`).
- `isRemote`: `false` for `ON-SITE`; `true` for `REMOTE`; `false` for `HYBRID`.
- `workFromHomeType`: `'On Site'` / `'Remote'` / `'Hybrid'` / `null`.
- `description`: plain-text content of the `article` element from the detail page.

### Filtering

`applyInput()` supports `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted`.

## Files

- `packages/plugins/source-company-cascade_space/package.json`
- `packages/plugins/source-company-cascade_space/tsconfig.json`
- `packages/plugins/source-company-cascade_space/src/index.ts`
- `packages/plugins/source-company-cascade_space/src/cascade_space.module.ts`
- `packages/plugins/source-company-cascade_space/src/cascade_space.service.ts`
- `packages/plugins/source-company-cascade_space/src/cascade_space.constants.ts`
- `packages/plugins/source-company-cascade_space/__tests__/cascade_space.service.spec.ts`
- `packages/plugins/source-company-cascade_space/__tests__/fixtures/careers.html`
- `packages/plugins/source-company-cascade_space/__tests__/fixtures/mech-e.html`
- `packages/models/src/enums/site.enum.ts`
- `packages/plugins/index.ts`
- `tsconfig.base.json`
- `jest.config.js`
- `docs/index.md`
- `docs/log.md`
