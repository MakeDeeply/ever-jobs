# Plan: 5101 — Source Company Plugin: The Spaceport Company

| Field | Value |
|-------|-------|
| Plan ID | 5101 |
| Spec | [spec.md](spec.md) |
| Status | in-progress |
| Created | 2026-09-03 |

## Phases

1. **Scaffold plugin package.**
   - Create `packages/plugins/source-company-thespaceportcompany/` with `package.json` and `tsconfig.json`.

2. **Add constants and module.**
   - `src/thespaceportcompany.constants.ts` with `CAREERS_URL`, `ORIGIN`, `COMPANY_NAME`, and defaults.
   - `src/thespaceportcompany.module.ts` exporting the NestJS module.
   - `src/index.ts` barrel file.

3. **Implement the scraper.**
   - `src/thespaceportcompany.service.ts` with `TheSpaceportcompanyService` implementing `IScraper`.
   - Parse the static Elementor page, skip hidden sections, build `JobPostDto` objects.
   - Honor `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted`.

4. **Register the plugin.**
   - `packages/models/src/enums/site.enum.ts` — add `Site.THE_SPACEPORT_COMPANY = 'thespaceportcompany'`.
   - `packages/plugins/index.ts` — import and include `TheSpaceportcompanyModule`.
   - `tsconfig.base.json` — add `@ever-jobs/source-company-thespaceportcompany` path.
   - `jest.config.js` — add `moduleNameMapper` entry.

5. **Write unit tests and fixture.**
   - `__tests__/thespaceportcompany.service.spec.ts` with a mocked HTTP client.
   - `__tests__/fixtures/careers.html` cached page fixture.

6. **Update docs.**
   - Add 5101 row to `docs/index.md`.
   - Append changelog entry to `docs/log.md`.

7. **Verification.**
   - `npx tsc --noEmit -p packages/plugins/source-company-thespaceportcompany/tsconfig.json`
   - `npx tsc --noEmit -p apps/api/tsconfig.json`
   - `npx jest --testPathPatterns thespaceportcompany`

## Packages touched

- `packages/plugins/source-company-thespaceportcompany` (new)
- `packages/models/src/enums/site.enum.ts`
- `packages/plugins/index.ts`
- `tsconfig.base.json`
- `jest.config.js`
- `docs/index.md`
- `docs/log.md`

## Risks / mitigations

- **Hidden sections change**: the selector checks all three `elementor-hidden-*` classes, so any section hidden on every breakpoint is excluded regardless of which data-id it carries.
- **Apply link changes**: if the mailto address changes, `applyUrl` will reflect the new address because it is read from the button `href`.
- **Location format changes**: location parsing falls back to headquarters city/state if the explicit "This role will be in the ..." phrase is removed.
