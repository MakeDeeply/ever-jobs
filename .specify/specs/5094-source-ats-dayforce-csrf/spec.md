# Spec: 5094 — Dayforce CSRF Handshake

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Spec ID        | 5094                                   |
| Slug           | source-ats-dayforce-csrf               |
| Status         | in progress                            |
| Owner          | devin                                  |
| Created        | 2026-09-03                             |
| Supersedes     | (none)                                 |
| Related specs  | 298 (source-ats-dayforce), 5093 (common-http-cookie-jar) |

## 1. Problem Statement

The Dayforce geo search endpoint `POST /api/geo/{client}/jobposting/search` now requires a valid `X-CSRF-TOKEN` header and the matching `__Host-next-auth.csrf-token` cookie. The current `DayforceService` posts directly to the search endpoint without first fetching a CSRF token, so requests are rejected with `403` and the scraper returns zero jobs for tenants like `yss`.

## 2. Goals

- Bootstrap a Dayforce session before the first search request by calling `GET /api/auth/csrf` with the candidate-portal page as the `Referer`.
- Enable the shared `HttpClient` cookie jar (`cookies: true`) so the `Set-Cookie` header from the CSRF response is automatically replayed on subsequent search POSTs.
- Extract `csrfToken` from the CSRF response and set it as the `X-CSRF-TOKEN` header for every search request.
- Return a clear `blocked` diagnostic (via `classifyScrapeError`) when the CSRF handshake fails, instead of silently returning zero jobs.

## 3. Non-Goals

- WAF / Cloudflare / TLS-fingerprint bypass. Tenants that still `403` after a correct CSRF handshake remain out of scope.
- Changing the geo search endpoint, pagination, or concurrency model.
- New legacy per-tenant host handling beyond the existing `clientFromUrl` helper.
- A generic `count()` or `probe()` mode for `find-company-ats`.

## 4. Scope

- `packages/plugins/source-ats-dayforce/src/dayforce.service.ts`
- `packages/plugins/source-ats-dayforce/src/dayforce.constants.ts` (update stale "no auth" comment)
- `packages/plugins/source-ats-dayforce/__tests__/dayforce.service.spec.ts` (new)

## 5. Functional Requirements

1. `DayforceService.scrape` creates an `HttpClient` with `cookies: true`.
2. Before the first `fetchPage` call, `scrape` calls `initSession(http, client, companyUrl)`.
3. `initSession` builds the candidate-portal `Referer` URL, calls `GET https://jobs.dayforcehcm.com/api/auth/csrf`, and reads `response.data.csrfToken`.
4. `initSession` sets `X-CSRF-TOKEN` and `Referer` as default headers on the `HttpClient` so every search POST carries them.
5. The cookie jar stores the `Set-Cookie` header from the CSRF response and replays the cookie on search POSTs.
6. If the CSRF endpoint returns an error or no token, `scrape` catches it and returns `new JobResponseDto([], classifyScrapeError(err))`.

## 6. Test Plan

- Unit test with a mocked `createHttpClient`:
  - `scrape` requests the CSRF endpoint first, then the search endpoint.
  - `X-CSRF-TOKEN` and `Referer` are set as default headers after the CSRF response.
  - A search response with postings is mapped to `JobPostDto` jobs.
  - A `403` from the CSRF endpoint yields `diagnostics.reason === 'blocked'` and zero jobs.
- Run `npx tsc --noEmit -p packages/plugins/source-ats-dayforce/tsconfig.json`.
- Run `npx jest --testPathPatterns source-ats-dayforce`.
