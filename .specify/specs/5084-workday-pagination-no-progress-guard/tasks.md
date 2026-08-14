# Tasks: 5084 — Workday pagination never stops when a tenant re-serves page 1

- [x] T1 — `@ever-jobs/common`: add `request-context.ts` (`runWithRequestId`, `getRequestId`) backed by `AsyncLocalStorage`; export from the package barrel. Acceptance: id readable from nested async callees, `undefined` outside any context.
- [x] T2 — `HttpClient`: retry warning names the request (`${method} ${url} failed ${status}, retry n/max in Xms`, `[id]` prefix when in scope); honor `Retry-After` (delta-seconds or HTTP-date) clamped to `retryMaxDelay`. Acceptance: unit tests assert the message content and the honored delay.
- [x] T3 — `apps/api`: request-context middleware in `main.ts`; `LoggingInterceptor` reuses `getRequestId()` rather than minting a second id. Acceptance: `X-Request-Id`, the access log, and outbound retry lines carry the same id.
- [x] T4 — Workday pagination: `workdayListingKey`; accumulate distinct listings only; break when a page adds zero new; stop when a positive `total` is reached; `resultsWanted` bounds distinct postings. Acceptance: a tenant that returns page 1 for every offset yields exactly its distinct postings in 2 list requests.
- [x] T5 — Workday enrichment: de-dupe before `fetchDetails`; skip enrichment when pagination failed; log an `N of M detail requests failed` summary. Acceptance: no detail request is issued twice for one posting, and a pagination failure issues none.
- [x] T6 — Tests: Workday cases (wrapping tenant, honest 24-job tenant, real page reporting `total: 0`, `resultsWanted` below board size, throwing pagination) and HttpClient cases (attribution, `Retry-After`, clamp). Acceptance: touched suites green.
- [x] T7 — Docs: `docs/index.md` row, `docs/log.md` entry (newest at top); `tsc --noEmit` and `lint:docs` clean.
