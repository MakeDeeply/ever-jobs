# Plan: 5097 — Source Company Plugin: Syncere

| Field | Value |
|-------|-------|
| Plan ID | 5097 |
| Spec | [spec.md](spec.md) |
| Status | in progress |

## Phases

1. **Create plugin package**
   - `packages/plugins/source-company-syncere/package.json`
   - `packages/plugins/source-company-syncere/tsconfig.json`
   - `packages/plugins/source-company-syncere/src/index.ts`
   - `packages/plugins/source-company-syncere/src/syncere.module.ts`
   - `packages/plugins/source-company-syncere/src/syncere.constants.ts`
   - `packages/plugins/source-company-syncere/src/syncere.types.ts`
   - `packages/plugins/source-company-syncere/src/syncere.service.ts`

2. **Implement `SyncereService`**
   - `@SourcePlugin({ site: Site.SYNCERE, name: 'Syncere', category: 'company', companyDomains: ['syncere.com', 'www.syncere.com'] })`.
   - Use `@ever-jobs/common` `createHttpClient` to fetch the start page and the Framer search index.
   - Parse `<meta name="framer-search-index">` with Cheerio.
   - Identify job pages, extract title, description, apply email, location, workplace type, and job type.
   - Apply `ScraperInputDto` filters and pagination.
   - Wrap in `JobResponseDto` and return `classifyScrapeError` diagnostics on failures.

3. **Register plugin**
   - `packages/models/src/enums/site.enum.ts`: `SYNCERE = 'syncere'`.
   - `packages/plugins/index.ts`: add `SyncereModule` import and array entry.
   - `tsconfig.base.json`: path alias `@ever-jobs/source-company-syncere`.
   - `jest.config.js`: matching `moduleNameMapper` entry.

4. **Write unit tests**
   - `packages/plugins/source-company-syncere/__tests__/syncere.service.spec.ts`
   - Mock the HTTP client with an HTML fixture and a JSON search-index fixture.
   - Assert all four jobs parse, filtering works, and error cases return diagnostics.

5. **Update docs**
   - Add 5097 row to `docs/index.md`.
   - Append changelog entry to `docs/log.md`.

## Packages touched

- `packages/plugins/source-company-syncere` (new)
- `packages/models` (`site.enum.ts`)
- `packages/plugins` (`index.ts`)
- `tsconfig.base.json`
- `jest.config.js`
- `docs/`

## Risks / mitigations

- **Search-index shape changes**: the parser reads the index URL from the live page meta tag and keys off the `p` array, so only a major Framer schema change would break it.
- **No posted date**: `datePosted` is intentionally left `null` because the source does not expose it.
