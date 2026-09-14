# Spec 5116 — Fix General Galactic Careers URL

| Field | Value |
|---|---|
| Spec ID | 5116 |
| Slug | `fix-gengalactic-careers-url` |
| Status | done |
| Owner | devin |
| Created | 2026-09-07 |
| Last updated | 2026-09-07 |
| Supersedes | (none) |
| Related specs | 5112 |

## 1. Problem Statement

`source-company-gengalactic` sets `GENGALACTIC_CAREERS_URL` to `https://gengalactic.com/careers.html`. The remote Webflow host returns 404 for that path; the canonical listing page is `https://gengalactic.com/careers`. Callers that do not pass an explicit `companyUrl` therefore get an empty result set.

## 2. Goals

- Change the plugin default to the canonical `/careers` URL.
- Update the unit-test mock and assertions so they exercise the correct URL.

## 3. Non-Goals

- No changes to `companyDomains`, `Site.GENGALACTIC`, or plugin registration.
- No changes to the parsing logic; the HTML shape is unchanged.
- No fetch-side behavior changes.

## 4. User / Caller Stories

> As a caller of `GengalacticService.scrape()` without an explicit `companyUrl`, I want the default URL to resolve to a 200 OK careers page, so that the plugin returns the 22 open roles.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | `GENGALACTIC_CAREERS_URL` must be `https://gengalactic.com/careers`. | must |
| FR-2 | `GengalacticService` unit tests must pass with the new default URL. | must |
| FR-3 | The existing custom-`companyUrl` test may keep `.html` to preserve coverage of caller-supplied URLs. | should |

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Plugin `tsc` and `jest` validation remain clean. | pass |

## 7. Contracts

### 7.1 Interface

```ts
const GENGALACTIC_CAREERS_URL = 'https://gengalactic.com/careers';
```

### 7.2 Errors

No new error codes. A 404 from the remote is already classified as `bad_input` by `classifyScrapeError`.

## 8. Test Plan

- `npx tsc --noEmit -p packages/plugins/source-company-gengalactic/tsconfig.json` clean.
- `npx jest --testPathPatterns gengalactic` passes.
- `npx jest --testPathPatterns company-domains-inline` passes.
- `npm run lint:docs` clean.

## 9. Open Questions

None.

## 10. Decisions

None yet.

## 11. References

- `packages/plugins/source-company-gengalactic/src/gengalactic.constants.ts`
- `packages/plugins/source-company-gengalactic/__tests__/gengalactic.service.spec.ts`
