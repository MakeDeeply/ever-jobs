# Plan: 5094 — Dayforce CSRF Handshake

## Phase 1 — Bootstrap

1. Update `dayforce.constants.ts` comment that claims the geo search is reachable without auth.
2. Add `DAYFORCE_CSRF_PATH` and `DAYFORCE_PORTAL_PATH_TEMPLATE` constants if needed.

## Phase 2 — Service changes

1. In `DayforceService.scrape`:
   - Create `HttpClient` with `cookies: true` (and pass through `requestTimeout` / `proxies`).
   - Keep `http.setHeaders(DAYFORCE_HEADERS)` before `initSession` so the CSRF request has the standard browser-like headers.
   - Call `await this.initSession(http, client, input.companyUrl)` before `fetchPage`.
2. Add private `initSession(http, client, companyUrl)`:
   - Build the candidate-portal `Referer` URL from `companyUrl` or the default `DAYFORCE_HOST` template.
   - `GET ${DAYFORCE_HOST}/api/auth/csrf` with `{ headers: { Referer: portalUrl } }`.
   - Read `csrfToken` from response data.
   - `http.setHeaders({ 'X-CSRF-TOKEN': token, Referer: portalUrl })`.
   - Throw a clear error if the token is missing.
3. Add private `buildPortalUrl(client, companyUrl)` helper.

## Phase 3 — Tests

1. Add `packages/plugins/source-ats-dayforce/__tests__/dayforce.service.spec.ts`.
2. Mock `createHttpClient` from `@ever-jobs/common` with a fake client that records `get` / `post` / `setHeaders` calls.
3. Cover the CSRF handshake, header propagation, happy-path search, and 403 diagnostic.

## Phase 4 — Docs and PR

1. Update `docs/index.md` (mark 5093 done, add 5094 in progress).
2. Append `docs/log.md` entry for 5094.
3. Commit, push, and open a PR into `develop`.
