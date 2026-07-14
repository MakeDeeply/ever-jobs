# Plan: 5057 — source-company-flymotion

## Phases

1. **Scaffold plugin package** `packages/plugins/source-company-flymotion`
    - `package.json`, `tsconfig.json`, `src/{index,flymotion.module,flymotion.service,flymotion.constants,flymotion.types}.ts`
2. **Constants/types** — origin, careers URL, role path prefix, defaults; opening/detail interfaces
3. **Service** — `IScraper.scrape`:
    - fetch `/company/careers` → `parseListing` (anchors `a[href*="/jobs/"]` deduped by slug; card title/location/employment-type)
    - fan out per-role detail fetches via `Promise.allSettled` → `parseDetail` (`<h1>`, `.w-richtext` → markdown, labelled detail cards, `Pay:` region)
    - `toJobPost` mapping (location via `parseLocationList`, jobType via `getJobTypeFromString`, ranged pay via `salaryToCompensation` with a single-amount fallback)
    - `applyInput` (searchTerm/location/isRemote/jobType filters + offset/resultsWanted)
    - graceful degradation on detail failure (listing fields only)
4. **Register in 4 places** — `Site.FLYMOTION`, `ALL_SOURCE_MODULES`, tsconfig path alias, jest `moduleNameMapper`
5. **Tests** — fixture-based unit tests over captured careers + detail page
6. **Docs** — `docs/index.md`, `docs/log.md` (top), `docs/questions.md`

## Packages touched

- `packages/plugins/source-company-flymotion` (new)
- `packages/models/src/enums/site.enum.ts`, `packages/plugins/index.ts`, `tsconfig.base.json`, `jest.config.js`
- `docs/*`

## Risks

- Webflow markup is bespoke; class-name selectors (`careers-job-listing-panel`, `job-detail-heading-wrapper`, `w-richtext`) may drift on a site redesign → parser returns empty and logs a warning (never invents data). Selectors are validated against captured fixtures.
- Pay is stated only in the rich-text prose (a single "From $X per year"), which the shared salary parser cannot represent (it requires a two-ended range). Handled with a min-only `CompensationDto` fallback; omitted if no amount is stated.
- Live count varies (data row said 1). The plugin ingests whatever is live and asserts no count.
