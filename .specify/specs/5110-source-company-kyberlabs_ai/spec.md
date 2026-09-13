# Spec 5110 — Source Company Plugin: Kyber Labs (`source-company-kyberlabs_ai`)

| Field | Value |
|---|---|
| Spec | 5110 |
| Slug | `source-company-kyberlabs_ai` |
| Status | done |
| Owner | devin |
| Created | 2026-09-07 |
| Last updated | 2026-09-07 |
| Related specs | 5069 (domain-to-token rule), 5109 (recent company plugin) |

## Problem

Kyber Labs (`kyberlabs.ai`) hosts its careers page at `https://kyberlabs.ai/jobs` on GoDaddy Website Builder. The static HTML contains a flex-widget job list with one visible opening (`Mechanical Engineer`, `Brooklyn, NY`, `Full time, in person`, apply link `/mech`). No recognized ATS was detected, so a dedicated `source-company-*` plugin is required to harvest it.

## Scope

- Add `packages/plugins/source-company-kyberlabs_ai` package.
- Parse the static `/jobs` page with `HttpClient` + Cheerio.
- Extract title, location, employment type, workplace mode, and apply URL.
- Map results to `JobPostDto` with `site: Site.KYBERLABS_AI` and `companyDomains: ['kyberlabs.ai']`.
- Register the plugin in `site.enum.ts`, `packages/plugins/index.ts`, `tsconfig.base.json`, and `jest.config.js`.
- Add a unit test with a mocked `HttpClient` response fixture.
- Update `docs/index.md` and `docs/log.md`.

## Non-Goals

- No `BrowserPool` rendering is needed; the content is static.
- No parsing of the `/mech` application page.
- No support for additional hosts unless they are verified company aliases.

## Acceptance Criteria

- `npx tsc --noEmit -p packages/plugins/source-company-kyberlabs_ai/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- `npx jest --testPathPatterns kyberlabs_ai` passes.
- `npm run lint:docs` is clean.

## Design

### HTTP fetch

`KyberlabsAiService.fetchJobs()` uses `createHttpClient()` from `@ever-jobs/common` to GET `https://kyberlabs.ai/jobs` (or `input.companyUrl` if provided). The response body is loaded into Cheerio.

### Page parsing

Each job lives inside a `section[data-ux="Section"]` that contains:

- `h2[data-aid="FLEX_HEADING"]` — job title.
- `div[data-aid="FLEX_RICHTEXT"]` — a `Location | employment, workplace` line such as `Brooklyn, NY | Full time, in person`.
- `a[data-aid="FLEX_CTA_BTN"]` — apply href, e.g. `/mech`.

The service iterates over `h2[data-aid="FLEX_HEADING"]` anchors, then for each anchor locates the nearest containing `section` and selects the matching rich-text and CTA elements.

### Field mapping

- `id`: `kyberlabs_ai-${slugify(title)}`.
- `site`: `Site.KYBERLABS_AI`.
- `companyName`: `'Kyber Labs'`.
- `companyUrl` / `jobUrl`: `https://kyberlabs.ai` or `input.companyUrl`.
- `applyUrl`: resolved absolute URL from the CTA href.
- `location`: parsed from the `Location` portion of the rich text (`Brooklyn, NY` → `LocationDto` with `country: Country.USA`).
- `jobType`: `[JobType.FULL_TIME]` by default; derived from the employment token.
- `employmentType`: human-readable token from the rich text (`Full time`).
- `isRemote`: `false` when workplace is `in person` / `on site`; `true` for `remote`; `false` for `hybrid`.
- `workFromHomeType`: `'On Site'` / `'Remote'` / `'Hybrid'` / `null`.

### Filtering

`applyInput()` supports `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted`.

## Files

- `packages/plugins/source-company-kyberlabs_ai/package.json`
- `packages/plugins/source-company-kyberlabs_ai/tsconfig.json`
- `packages/plugins/source-company-kyberlabs_ai/src/index.ts`
- `packages/plugins/source-company-kyberlabs_ai/src/kyberlabs_ai.module.ts`
- `packages/plugins/source-company-kyberlabs_ai/src/kyberlabs_ai.service.ts`
- `packages/plugins/source-company-kyberlabs_ai/src/kyberlabs_ai.constants.ts`
- `packages/plugins/source-company-kyberlabs_ai/src/kyberlabs_ai.types.ts`
- `packages/plugins/source-company-kyberlabs_ai/__tests__/kyberlabs_ai.service.spec.ts`
- `packages/plugins/source-company-kyberlabs_ai/__tests__/fixtures/jobs.html`
- `packages/models/src/enums/site.enum.ts`
- `packages/plugins/index.ts`
- `tsconfig.base.json`
- `jest.config.js`
- `docs/index.md`
- `docs/log.md`
