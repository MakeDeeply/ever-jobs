# Plan: 5099 — Source Company Plugin: Launchpad Build AI

| Field | Value |
|-------|-------|
| Plan ID | 5099 |
| Spec | [spec.md](spec.md) |
| Status | in progress |

## Phases

1. **Create plugin package**
   - `packages/plugins/source-company-launchpadbuild_ai/package.json`
   - `packages/plugins/source-company-launchpadbuild_ai/tsconfig.json`
   - `packages/plugins/source-company-launchpadbuild_ai/src/index.ts`
   - `packages/plugins/source-company-launchpadbuild_ai/src/launchpadbuild_ai.module.ts`
   - `packages/plugins/source-company-launchpadbuild_ai/src/launchpadbuild_ai.constants.ts`
   - `packages/plugins/source-company-launchpadbuild_ai/src/launchpadbuild_ai.service.ts`

2. **Implement `LaunchpadbuildAiService`**
   - `@SourcePlugin({ site: Site.LAUNCHPADBUILD_AI, name: 'Launchpad Build AI', category: 'company', companyDomains: ['launchpadbuild.ai', 'www.launchpadbuild.ai'] })`.
   - Use `@ever-jobs/common` `createHttpClient` to fetch the careers list and each detail page.
   - Parse the `awsm-job-listings` list and per-role detail pages.
   - Extract title, apply URL, markdown description, location, work-from-home type, compensation, employment type, and workplace type.
   - Apply `ScraperInputDto` filters and pagination.
   - Wrap in `JobResponseDto` and return `classifyScrapeError` diagnostics on failures.

3. **Register plugin**
   - `packages/models/src/enums/site.enum.ts`: `LAUNCHPADBUILD_AI = 'launchpadbuild_ai'`.
   - `packages/plugins/index.ts`: add `LaunchpadbuildAiModule` import and array entry in the second alphabetical batch.
   - `tsconfig.base.json`: path alias `@ever-jobs/source-company-launchpadbuild_ai`.
   - `jest.config.js`: matching `moduleNameMapper` entry.

4. **Write unit tests**
   - `packages/plugins/source-company-launchpadbuild_ai/__tests__/launchpadbuild_ai.service.spec.ts`
   - Mock the HTTP client with a careers-list HTML fixture and two detail-page HTML fixtures.
   - Assert all observed jobs parse, filtering works, and error cases return diagnostics.

5. **Update docs**
   - Add 5099 row to `docs/index.md`.
   - Append changelog entry to `docs/log.md`.

## Packages touched

- `packages/plugins/source-company-launchpadbuild_ai` (new)
- `packages/models` (`site.enum.ts`)
- `packages/plugins` (`index.ts`)
- `tsconfig.base.json`
- `jest.config.js`
- `docs/`

## Risks / mitigations

- **WP Job Openings markup churn**: selectors are restricted to observed class names; tests use committed fixtures so regressions are caught.
- **Both hourly and annual compensation figures**: the parser splits by `, or ` and prefers the segment containing `per year` / `annual` / `salaried`.
- **UK inference scope**: only the literal phrase `UK based` maps to `Country.UK`; no broader inference is performed.
