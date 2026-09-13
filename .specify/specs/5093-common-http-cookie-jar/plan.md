# Plan: 5093 — Opt-in Cookie Jar for `@ever-jobs/common HttpClient`

## Phases

### Phase 1 — Spec & dependencies
- Create Spec Kit 5093 (`spec.md`, `plan.md`, `tasks.md`) under `.specify/specs/5093-common-http-cookie-jar/`.
- Add `tough-cookie@^6.0.2` to root `dependencies` and run `npm install`.

### Phase 2 — Core implementation
- Update `packages/common/src/http/http-client.ts`:
  - Import `CookieJar` from `tough-cookie` and `AxiosHeaders` from `axios`.
  - Add `cookies?: boolean | CookieJar` to `HttpClientOptions`.
  - Add a private `cookieJar?: CookieJar` field.
  - In the constructor, initialize the jar and attach axios request/response interceptors when `cookies` is enabled.
  - Implement `applyRequestCookies` to read `getCookieStringSync(url)` and merge it into the outgoing `Cookie` header.
  - Implement `storeResponseCookies` to call `setCookieSync` for each `Set-Cookie` value on the response URL.
  - Forward `cookies` through `createHttpClient()`.

### Phase 3 — Tests
- Add `packages/common/__tests__/http-client-cookies.spec.ts`:
  - Mock `axios.create` to return an instance with `defaults.headers.common`, `interceptors.request.use`, and `interceptors.response.use`.
  - Simulate a request with `set-cookie`, then a second request and assert the `Cookie` header is sent.
  - Assert manual `Cookie` header merging.
  - Assert default instance has no cookie behavior.
  - Assert shared `CookieJar` is reused.
  - Assert malformed `Set-Cookie` is ignored.

### Phase 4 — Docs & hygiene
- Update `docs/index.md` with spec 5093 row.
- Update `docs/log.md` with changelog entry.
- Run `npx tsc --noEmit -p packages/common/tsconfig.json`.
- Run `npx jest --testPathPatterns http-client`.
- Commit, push, and open PR from `devin/5093-common-http-cookie-jar` to `develop`.
- Wait on `git_pr_checks`.

## Risks

| Risk                                             | Mitigation                                                 |
| ------------------------------------------------ | ---------------------------------------------------------- |
| `tough-cookie` v6 is ESM/CJS dual package        | `main` points to `dist/index.cjs` and types to `dist/index.d.ts`; verify with `tsc` |
| Interceptor change affects all `HttpClient` users | Feature is opt-in and interceptors only install when enabled |
| Cookie merging overwrites caller `Cookie` header | Append jar cookies after any existing header, with `;` separator |

## Packages touched

- `packages/common` (runtime + tests)
- root `package.json` / `package-lock.json`
- `docs/index.md`, `docs/log.md`
