# Plan: 5096 — Use unambiguous `companyUrl` as a routing fallback in `JobsService`

## Phases

1. **Add `resolveCompanyUrl` helper**
   - New file `packages/common/src/utils/site-from-url.ts`.
   - Export from `packages/common/src/utils/index.ts`.
   - Hard-coded allow-list of canonical ATS board hosts.
   - Returns `{ site?: Site; slug?: string }` or `{}`.

2. **Wire `companyUrl` fallback into `JobsService.searchJobsWithDiagnostics`**
   - Import `resolveCompanyUrl` in `apps/api/src/jobs/jobs.service.ts`.
   - After `buildEffectiveSites`, if `effectiveSites` is empty and unresolved `companyDomain` values exist, call `resolveCompanyUrl(input.companyUrl)`.
   - If it returns a `site`, append to `effectiveSites` and set `input.companySlug` from the returned `slug` only when `input.companySlug` is missing.
   - Leave the existing `BadRequestException` and diagnostic logic unchanged.

3. **Update `ScraperInputDto` documentation**
   - Clarify `companyUrl` may select an ATS plugin when `companyDomain` does not resolve.

4. **Tests**
   - `packages/common/__tests__/site-from-url.spec.ts` for the helper.
   - Extend `apps/api/src/jobs/__tests__/jobs.service.spec.ts` for routing fallback cases.

5. **Docs**
   - Add 5096 row to `docs/index.md`.
   - Append changelog entry to `docs/log.md`.

## Packages touched

- `packages/common` (new utility)
- `packages/models` (JSDoc only, `ScraperInputDto`)
- `apps/api` (`JobsService`, unit tests)
- `docs/` (index + log)

## Risks / mitigations

- **False positives from URL parsing**: restricted to a small, explicit allow-list of canonical ATS hosts.
- **Conflict with explicit `companySlug`**: fallback only populates `companySlug` when it is not already set.
- **Custom CNAME boards**: out of scope; they continue to rely on `companyDomains` or `siteType`.
