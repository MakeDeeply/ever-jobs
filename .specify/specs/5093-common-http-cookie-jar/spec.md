# Spec: 5093 — Opt-in Cookie Jar for `@ever-jobs/common HttpClient`

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Spec ID        | 5093                               |
| Slug           | common-http-cookie-jar             |
| Status         | in-progress                        |
| Owner          | devin                              |
| Created        | 2026-09-03                         |
| Last updated   | 2026-09-03                         |
| Supersedes     | (none)                             |
| Related specs  | (Dayforce CSRF handshake — follow-up) |

## 1. Problem Statement

`HttpClient` is a stateless axios wrapper: each request carries only the headers explicitly supplied by the caller. Some upstream career-board hosts now require a session cookie + CSRF token handshake across two requests (e.g. a `GET /api/auth/csrf` that sets `Set-Cookie`, then a `POST` that needs both the returned cookie and the token). Because `HttpClient` does not persist cookies, callers must manually parse `Set-Cookie`, store state, and replay it on later requests. This is fragile and duplicates state-management logic in every plugin that needs it.

## 2. Goals

- Add an opt-in cookie jar to `HttpClient` so a single client instance can transparently persist and replay cookies across requests.
- Keep the change backward-compatible: existing callers that do not opt in see no behavior change.
- Provide a typed, testable interface that callers (e.g. a follow-up Dayforce fix) can enable with one option.

## 3. Non-Goals

- Do not implement the Dayforce CSRF handshake in this PR.
- Do not make cookie handling global or on by default.
- Do not modify plugins other than `@ever-jobs/common`.
- Do not expose browser-level cookie UI, persistence to disk, or cross-instance sharing beyond passing a shared `CookieJar` instance.

## 4. User / Caller Stories

> As a plugin author, I want `HttpClient` to remember `Set-Cookie` headers between requests so that I can fetch a CSRF endpoint and then POST protected search endpoints without manual cookie bookkeeping.

> As a maintainer, I want cookie support to be opt-in so existing scrapers keep their current request/response contract.

## 5. Functional Requirements

| ID    | Requirement                                                                                           | Priority |
| ----- | ----------------------------------------------------------------------------------------------------- | -------- |
| FR-1  | `HttpClientOptions` accepts `cookies?: boolean \| CookieJar`.                                         | must     |
| FR-2  | When `cookies: true`, `HttpClient` creates an isolated `tough-cookie` `CookieJar`.                    | must     |
| FR-3  | When `cookies` is a `CookieJar`, `HttpClient` uses the supplied instance.                             | must     |
| FR-4  | Before each request, matching cookies are read from the jar and merged into the `Cookie` header.      | must     |
| FR-5  | After each response, every `Set-Cookie` header is stored in the jar for the response URL.             | must     |
| FR-6  | The `Cookie` header is merged with any manually supplied `Cookie` header, not overwritten.               | must     |
| FR-7  | When `cookies` is omitted/false, no interceptors are installed and behavior is unchanged.            | must     |
| FR-8  | `createHttpClient()` forwards `cookies` from the input options to `HttpClient`.                      | should   |

## 6. Non-Functional Requirements

| ID     | Requirement                                            | Target            |
| ------ | ------------------------------------------------------ | ----------------- |
| NFR-1  | No measurable latency increase when disabled           | `0 ms`            |
| NFR-2  | Cookie parsing errors must not fail the request        | log and continue  |
| NFR-3  | `Set-Cookie` attributes (`Secure`, `HttpOnly`, `Path`, `Domain`, `SameSite`, `Expires`) are honored | via `tough-cookie` |
| NFR-4  | `Cookie` header merging must be safe for `AxiosHeaders` and plain objects | unit tested       |

## 7. Contracts

### 7.1 API / Interface

```ts
export interface HttpClientOptions {
  // ... existing fields
  /**
   * Enable cookie handling. When `true`, an isolated `CookieJar` is created for
   * this client. Pass a `CookieJar` instance to share state across requests.
   */
  cookies?: boolean | CookieJar;
}

export class HttpClient {
  constructor(options?: HttpClientOptions);
  // ... unchanged public surface
}

export function createHttpClient(options?: HttpClientOptions | any): HttpClient;
```

`CookieJar` is re-exported as a value from `tough-cookie` for callers that need a shared instance.

### 7.2 Errors

No new public error codes. Invalid `Set-Cookie` values are logged at `debug` and ignored; malformed jars raise standard `tough-cookie` errors.

## 8. Test Plan

- Unit: `packages/common/__tests__/http-client-cookies.spec.ts` with `axios` mocked:
  - `Set-Cookie` from response 1 is sent as `Cookie` on request 2.
  - A manually supplied `Cookie` header is preserved and merged with jar cookies.
  - Opt-in is required: default `HttpClient` does not send stored cookies.
  - Cookie jar option `false` and omitted are equivalent.
  - Shared `CookieJar` instance state is reused across two `HttpClient` instances.
  - Malformed `Set-Cookie` headers do not break the response interceptor.
- Type check: `npx tsc --noEmit -p packages/common/tsconfig.json`.
- Lint: `npm run lint` on changed files.

## 9. Open Questions

(none — decisions below)

## 10. Decisions

- Use `tough-cookie@6.0.2` because it ships its own TypeScript types and is a well-maintained RFC 6265 implementation.
- Keep the jar private to `HttpClient`; do not expose it on the public class surface.
- Merge `Cookie` headers by appending `; <jar-cookies>` to any existing value, matching browser behavior for same-name cookies.
- Install interceptors lazily only when `cookies` is truthy, so default instances avoid any cookie overhead.

## 11. References

- `packages/common/src/http/http-client.ts`
- `packages/common/__tests__/http-client.spec.ts`
- `tough-cookie` RFC 6265 implementation: https://www.npmjs.com/package/tough-cookie
