# Spec: 5095 — Resolve mixed `companyDomain` / `siteType` routing in `JobsService`

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Spec ID        | 5095                               |
| Slug           | jobs-service-companydomain-routing |
| Status         | in-progress                        |
| Owner          | devin                              |
| Created        | 2026-09-03                         |
| Supersedes     | (none)                             |
| Related specs  | 5069 (domain-token derivation), 5086 (plugin `companyDomains` declaration), 5082 (per-source diagnostics) |

## 1. Problem Statement

`JobsService.searchJobsWithDiagnostics` resolves `companyDomain` values to `Site` tokens before it unions them with explicit `siteType` values. The current `resolveCompanyDomains` implementation throws `BadRequestException` as soon as it sees an unresolved domain, so a request that carries both an unresolvable `companyDomain` hint and a valid `siteType` fails before the valid `siteType` can be used.

This is a problem when a caller knows the correct plugin `Site` token and also supplies the company's domain as a secondary signal: the domain may not derive to a registered plugin (or the plugin may not declare it), but the request should still succeed via the explicit `siteType`.

## 2. Goals

- Allow `companyDomain` and `siteType` to coexist in a single `ScraperInputDto`.
- Continue to reject the case where *neither* `companyDomain` nor `siteType` resolves.
- Surface unresolved `companyDomain` entries as per-source `bad_input` diagnostics when the request proceeds.
- Keep the default routing (ATS scrapers with `companySlug`, search + company scrapers otherwise) unchanged.

## 3. Non-Goals

- Do not change the `ScraperInputDto` shape or validation.
- Do not add `companyDomains` declarations to any plugin (that is Spec 5086).
- Do not change `HttpClient`, plugin contracts, or `siteFromDomain` derivation.
- Do not relax validation for malformed `companyDomain` strings (empty/whitespace still ignored).

## 4. User / Caller Stories

> As a caller, I want to pass `companyDomain` as a hint and `siteType` as the authoritative selector, so the request succeeds even when the domain does not map to a plugin token.

> As an operator, I want unresolved `companyDomain` hints to appear as diagnostics rather than silently disappear, so I can tell which company domains still need plugin metadata.

## 5. Functional Requirements

| ID    | Requirement                                                                                           | Priority |
| ----- | ----------------------------------------------------------------------------------------------------- | -------- |
| FR-1  | `resolveCompanyDomains` returns `{ resolved: Set<Site>; unresolved: string[] }` and never throws.     | must     |
| FR-2  | `searchJobsWithDiagnostics` builds `effectiveSites` by unioning `siteType` with resolved domains.     | must     |
| FR-3  | If `effectiveSites` is empty and there are unresolved domains, throw `BadRequestException` with the existing message format. | must     |
| FR-4  | If `effectiveSites` is non-empty, the request proceeds and unresolved domains are added to `perSource` as `bad_input` diagnostics. | must     |
| FR-5  | Empty and whitespace-only `companyDomain` entries are still skipped.                                  | must     |
| FR-6  | Existing routing branches (`companySlug` → ATS, default → non-ATS) are preserved when `effectiveSites` is empty and no unresolved domains exist. | must     |

## 6. Non-Functional Requirements

| ID     | Requirement                                            | Target            |
| ------ | ------------------------------------------------------ | ----------------- |
| NFR-1  | No additional HTTP requests introduced                 | zero              |
| NFR-2  | Response shape unchanged except for the new diagnostic rows | unit tested |
| NFR-3  | Existing `BadRequestException` cases continue to throw | unit tested       |

## 7. Contracts

### 7.1 Internal API

```ts
private resolveCompanyDomains(domains: string[] | undefined): {
  resolved: Set<Site>;
  unresolved: string[];
};
```

`resolved` contains every `companyDomain` that maps to a registered `Site` token. `unresolved` contains the trimmed, non-empty domains that did not map.

### 7.2 `SourceDiagnosticDto` for unresolved domains

When the request proceeds, each unresolved `companyDomain` produces one row:

```ts
new SourceDiagnosticDto(
  `companyDomain:${domain}`,
  0,
  'bad_input',
  `domain \`${domain}\` → token \`${deriveSiteToken(domain)}\` is not a registered plugin`,
);
```

These rows are appended to `perSource` before `searchJobsWithDiagnostics` returns.

### 7.3 Error messages

The `BadRequestException` message keeps the existing format:

```
domain `<domain>` → token `<derived>` is not a registered plugin
```

Multiple unresolved domains are joined with `; `.

## 8. Test Plan

- Unit: extend `apps/api/src/jobs/__tests__/jobs.service.spec.ts`:
  - `companyDomain` only, unresolvable → `BadRequestException`.
  - `siteType` only, valid → returns jobs, no diagnostics.
  - `siteType` valid + `companyDomain` unresolvable → returns jobs and one `bad_input` diagnostic per unresolved domain.
  - `siteType` invalid + `companyDomain` unresolvable → `BadRequestException`.
  - `companyDomain` mixed (one valid, one unresolved) + `siteType` valid → unioned sites + `bad_input` diagnostic for the unresolved domain.
  - `companyDomain` all empty + `siteType` valid → proceeds with `siteType` only.
- Type check: `npx tsc --noEmit -p apps/api/tsconfig.json`.
- Focused tests: `npx jest --testPathPatterns jobs.service`.

## 9. Open Questions

(none — decisions below)

## 10. Decisions

- Keep `resolveCompanyDomains` private and change only its return shape; do not expose it on the public API.
- Do not fall back to default routing when `companyDomain` is explicitly provided but unresolved; the caller has made an explicit (and failing) selection, so `BadRequestException` is appropriate.
- Use `companyDomain:<domain>` as the `site` field for diagnostic rows so they are clearly distinguishable from real source rows.

## 11. References

- `apps/api/src/jobs/jobs.service.ts`
- `apps/api/src/jobs/__tests__/jobs.service.spec.ts`
- `packages/models/src/dtos/scraper-input.dto.ts`
- `packages/models/src/dtos/scrape-diagnostics.dto.ts`
