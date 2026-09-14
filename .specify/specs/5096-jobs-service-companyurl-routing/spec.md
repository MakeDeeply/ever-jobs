# Spec: 5096 — Use unambiguous `companyUrl` as a routing fallback in `JobsService`

| Field | Value |
|-------|-------|
| Spec ID | 5096 |
| Slug | jobs-service-companyurl-routing |
| Status | in-progress |
| Owner | devin |
| Created | 2026-09-03 |
| Supersedes | (none) |
| Related specs | 5095 (companyDomain/siteType routing), 5069 (domain-token derivation), 5086 (plugin companyDomains) |

## 1. Problem Statement

`JobsService.searchJobsWithDiagnostics` selects scrapers from `siteType` and resolved `companyDomain` values. When `companyDomain` does not map to a registered `Site` token and the caller also supplies a canonical ATS board URL in `companyUrl`, the service still throws `BadRequestException` because it never considers `companyUrl` as an explicit selector.

This fails legitimate requests where the caller knows the exact board URL (e.g. `https://boards.greenhouse.io/<slug>` or `https://jobs.ashbyhq.com/<slug>`) but the company domain token does not follow the Spec 5069 derivation.

## 2. Goals

- Treat a `companyUrl` that unambiguously identifies a known ATS board as an explicit selector.
- Derive both `siteType` and `companySlug` from that URL so the appropriate ATS plugin runs.
- Keep the existing `BadRequestException` behavior when neither `companyDomain`, `siteType`, nor `companyUrl` resolves.
- Surface `companyDomain` values that did not map as `bad_input` diagnostics when the request proceeds via `companyUrl`.

## 3. Non-Goals

- Do not change `ScraperInputDto` shape or validation.
- Do not add `companyDomains` declarations to any plugin.
- Do not support custom/career-portal URLs that do not match a known ATS board pattern or a registered `companyDomains` entry.
- Do not parse arbitrary `companyUrl` hosts beyond an explicit allow-list; unknown URLs fall through normally.

## 4. Caller Stories

> As a caller, I want to pass the company's domain and the exact ATS board URL; if the domain token is not recognized, the board URL should still route to the right ATS plugin.

> As an operator, I want the unrecognized `companyDomain` to appear as a `bad_input` diagnostic even when the `companyUrl` fallback succeeds, so mismatched domain metadata remains visible.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | `resolveCompanyUrl` parses a canonical ATS board URL and returns `{ site?: Site; slug?: string }`. | must |
| FR-2 | `searchJobsWithDiagnostics` invokes `resolveCompanyUrl` when `effectiveSites` is empty and there are unresolved `companyDomain` values. | must |
| FR-3 | If `resolveCompanyUrl` returns a `site`, that site is added to `effectiveSites` and `companySlug` is set from the returned `slug` when `input.companySlug` is empty. | must |
| FR-4 | If `effectiveSites` is still empty after the `companyUrl` fallback, the existing `BadRequestException` for unresolved `companyDomain` values is thrown. | must |
| FR-5 | When the request proceeds, unresolved `companyDomain` values are still reported as `bad_input` `SourceDiagnosticDto` rows. | must |
| FR-6 | `companyUrl` values that do not match a known pattern are ignored; no new error is introduced for them. | must |

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | No additional HTTP requests | zero |
| NFR-2 | Existing `companyUrl` semantics for plugins that already consume it remain unchanged | unit tested |
| NFR-3 | Existing 400 cases for `companyDomain` only remain unchanged | unit tested |

## 7. Contracts

### 7.1 `resolveCompanyUrl(url: string): { site?: Site; slug?: string }`

Implemented in `@ever-jobs/common`. It:

1. Normalizes the URL (adds `https://` if no scheme).
2. Matches the host against an explicit allow-list of canonical ATS board hosts and maps to a `Site` value.
3. Returns the first non-empty path segment as `slug` for board hosts where the slug lives in the path.

Initial allow-list:
- `boards.greenhouse.io` → `Site.GREENHOUSE`
- `job-boards.greenhouse.io` → `Site.GREENHOUSE`
- `jobs.ashbyhq.com` → `Site.ASHBY`
- `jobs.lever.co` → `Site.LEVER`

Unknown hosts return `{}`.

### 7.2 `JobsService` routing

After `buildEffectiveSites(input.siteType, resolvedSites)`:

```ts
const companyUrlFallback = this.resolveCompanyUrl(input.companyUrl);
if (effectiveSites.length === 0 && unresolvedDomains.length > 0 && companyUrlFallback.site) {
  effectiveSites = [companyUrlFallback.site];
  input.companySlug ??= companyUrlFallback.slug;
}
```

Then the existing throw/proceed logic runs. `effectiveSites` is mutable in this block.

## 8. Test Plan

- Unit: `packages/common/__tests__/site-from-url.spec.ts`:
  - `boards.greenhouse.io/vast` → `GREENHOUSE`, slug `vast`
  - `jobs.ashbyhq.com/northwoodspace` → `ASHBY`, slug `northwoodspace`
  - `job-boards.greenhouse.io/trueanomalyinc/jobs/123` → `GREENHOUSE`, slug `trueanomalyinc`
  - Unknown host → no site/slug
  - Malformed URL → no site/slug
  - URL without scheme → parsed
- Unit: extend `apps/api/src/jobs/__tests__/jobs.service.spec.ts`:
  - `companyDomain` bad + `companyUrl` canonical → proceeds, scraper called with `companySlug` set, `bad_input` diagnostic for `companyDomain`
  - `companyDomain` bad + `companyUrl` canonical + `companySlug` already set → does not override `companySlug`
  - `companyDomain` bad + `companyUrl` unknown + no `siteType` → throws `BadRequestException`
- Type check: `npx tsc --noEmit -p apps/api/tsconfig.json`.
- Focused tests: `npx jest --testPathPatterns jobs.service`.

## 9. Open Questions

(none)

## 10. Decisions

- Keep the host allow-list small and explicit; generic custom career portals are out of scope.
- Do not override an explicit `companySlug`; only populate it when missing.
- Reuse `bad_input` diagnostic format from Spec 5095 for unresolved `companyDomain` values.

## 11. References

- `apps/api/src/jobs/jobs.service.ts`
- `packages/common/src/utils/site-from-url.ts`
- `packages/models/src/dtos/scraper-input.dto.ts`
- `packages/common/__tests__/site-from-url.spec.ts`
- `apps/api/src/jobs/__tests__/jobs.service.spec.ts`
