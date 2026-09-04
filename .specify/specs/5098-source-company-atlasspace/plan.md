# Plan: 5098 — Source Company Plugin: ATLAS Space Operations

| Field | Value |
|-------|-------|
| Plan ID | 5098 |
| Spec | [spec.md](spec.md) |
| Status | in progress |

## Phases

1. **Create plugin package**
   - `packages/plugins/source-company-atlasspace/package.json`
   - `packages/plugins/source-company-atlasspace/tsconfig.json`
   - `packages/plugins/source-company-atlasspace/src/index.ts`
   - `packages/plugins/source-company-atlasspace/src/atlasspace.module.ts`
   - `packages/plugins/source-company-atlasspace/src/atlasspace.constants.ts`
   - `packages/plugins/source-company-atlasspace/src/atlasspace.service.ts`

2. **Implement `AtlasspaceService`**
   - `@SourcePlugin({ site: Site.ATLAS, name: 'ATLAS Space Operations', category: 'company', companyDomains: ['atlasspace.com', 'www.atlasspace.com'] })`.
   - Use `@ever-jobs/common` `createHttpClient` to fetch the careers list and each detail page.
   - Parse the `Current Openings` Elementor icon list and per-role detail pages.
   - Extract title, apply URL, markdown description, location, compensation, employment type, and workplace type.
   - Apply `ScraperInputDto` filters and pagination.
   - Wrap in `JobResponseDto` and return `classifyScrapeError` diagnostics on failures.

3. **Register plugin**
   - `packages/models/src/enums/site.enum.ts`: `ATLAS = 'atlasspace'`.
   - `packages/plugins/index.ts`: add `AtlasspaceModule` import and array entry in the second alphabetical batch.
   - `tsconfig.base.json`: path alias `@ever-jobs/source-company-atlasspace`.
   - `jest.config.js`: matching `moduleNameMapper` entry.

4. **Write unit tests**
   - `packages/plugins/source-company-atlasspace/__tests__/atlasspace.service.spec.ts`
   - Mock the HTTP client with a careers-list HTML fixture and two detail-page HTML fixtures.
   - Assert all observed jobs parse, filtering works, and error cases return diagnostics.

5. **Update docs**
   - Add 5098 row to `docs/index.md`.
   - Append changelog entry to `docs/log.md`.

## Packages touched

- `packages/plugins/source-company-atlasspace` (new)
- `packages/models` (`site.enum.ts`)
- `packages/plugins` (`index.ts`)
- `tsconfig.base.json`
- `jest.config.js`
- `docs/`

## Risks / mitigations

- **Elementor widget churn**: selectors are restricted to observed class names; tests use committed fixtures so regressions are caught.
- **No explicit job type**: annual salary presence defaults to `FULL_TIME` and is noted in the spec.
- **Generic apply URL**: `applyUrl` is set from the `Apply for this Job` button as published.
