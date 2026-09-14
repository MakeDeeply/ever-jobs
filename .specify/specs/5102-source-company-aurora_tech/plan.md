# Plan: 5102 — Source Company Plugin: Aurora (rename and Ashby migration)

| Field | Value |
|-------|-------|
| Plan ID | 5102 |
| Spec | [spec.md](spec.md) |
| Status | in-progress |
| Created | 2026-09-03 |

## Phases

1. **Rename plugin package.**
   - `git mv packages/plugins/source-company-aurorainnovation packages/plugins/source-company-aurora_tech`.
   - Rename `src/aurorainnovation.module.ts` → `src/auroratech.module.ts` and `src/aurorainnovation.service.ts` → `src/auroratech.service.ts`.
   - Update `src/index.ts` exports.
   - Update `package.json` name to `@ever-jobs/source-company-aurora_tech`.

2. **Update plugin source.**
   - `src/auroratech.constants.ts` with `ASHBY_API_URL`, `ASHBY_INCLUDE_COMPENSATION_QUERY`, `DEFAULT_BOARD`, `COMPANY_NAME`, `COMPANY_URL`, and default timeout/results.
   - `src/auroratech.module.ts` exporting `AuroraTechModule`.
   - `src/auroratech.service.ts` implementing `AuroraTechService` with Ashby public API call and job mapping.

3. **Register in canonical files.**
   - `packages/models/src/enums/site.enum.ts`: `AURORA_TECH = 'aurora_tech'` (remove `AURORA_INNOVATION`).
   - `packages/plugins/index.ts`: replace `AuroraInnovationModule` import/export with `AuroraTechModule`.
   - `tsconfig.base.json`: replace `@ever-jobs/source-company-aurorainnovation` path with `@ever-jobs/source-company-aurora_tech`.
   - `jest.config.js`: replace `source-company-aurorainnovation` module name mapper with `source-company-aurora_tech`.

4. **Write unit tests and fixture.**
   - `__tests__/auroratech.service.spec.ts` mocking `@ever-jobs/common` `createHttpClient`.
   - `__tests__/fixtures/ashby-jobs.json` or inline response object.

5. **Update docs.**
   - Add 5102 row to `docs/index.md`.
   - Append changelog entry to `docs/log.md`.

6. **Verification.**
   - `npx tsc --noEmit -p packages/plugins/source-company-aurora_tech/tsconfig.json`
   - `npx tsc --noEmit -p apps/api/tsconfig.json`
   - `npx jest --testPathPatterns aurora_tech`

## Packages touched

- `packages/plugins/source-company-aurora_tech` (renamed from `source-company-aurorainnovation`)
- `packages/models/src/enums/site.enum.ts`
- `packages/plugins/index.ts`
- `tsconfig.base.json`
- `jest.config.js`
- `docs/index.md`
- `docs/log.md`

## Risks / mitigations

- **Old token removal**: `grep` confirms no other package references `AURORA_INNOVATION` or `aurorainnovation` outside the plugin and registrations.
- **Ashby response shape drift**: mapping uses optional chaining and nullish coalescing; missing compensation or location fields degrade gracefully.
- **Compensation interval values**: normalized through `getCompensationInterval` from `@ever-jobs/common`.
