# Plan: 5084 — Workday pagination never stops when a tenant re-serves page 1

| Field        | Value        |
| ------------ | ------------ |
| Spec         | spec.md      |
| Created      | 2026-06-28   |
| Last updated | 2026-06-28   |

## Phases

1. **Request context (`@ever-jobs/common`).** `AsyncLocalStorage`-based `runWithRequestId` /
   `getRequestId`. Leaf addition, no consumer yet.
2. **`HttpClient`.** Attributed retry warning (method + URL + attempt + delay, id when in scope);
   `Retry-After` honored on retryable statuses, clamped to `retryMaxDelay`.
3. **API wiring.** Middleware establishes the context per request; the logging interceptor reuses that
   id instead of minting an unrelated second one, so the access log and outbound retries agree.
4. **Workday pagination.** `workdayListingKey` helper; distinct-progress accumulation; no-progress
   break; positive-`total` fast path; `resultsWanted` bounds distinct postings.
5. **Workday enrichment.** De-dupe before `fetchDetails`; skip enrichment entirely after a pagination
   failure; per-scrape detail-failure summary.
6. **Tests + docs.** Workday suite cases for wrapping/honest/`total:0`/throwing tenants; HttpClient
   cases for attribution and `Retry-After`; `docs/index.md`, `docs/log.md`.

## Packages touched

- `packages/common`
- `packages/plugins/source-ats-workday`
- `apps/api`

## Risks

- **Over-eager stop truncating a real board.** Mitigated: the guard stops only when a page adds *zero*
  new postings, and the `total` fast path ignores a zero/absent `total` (the wrapping tenant's genuine
  second page reports `total: 0`). Covered by the 24-job honest-tenant test.
- **De-dup key wrong for some tenant.** `externalPath` is the detail-URL path, unique per requisition;
  pathless listings fall back to `title` so nothing is dropped silently.
- **Skipping enrichment on failure loses partial results.** Intentional: those listings are exactly the
  ones that funded the 429 storm, and the response already reports diagnostics instead.
- **`AsyncLocalStorage` overhead / context loss.** One store, set in Express middleware so the whole
  downstream async tree inherits it; `getRequestId()` returns `undefined` outside a request (CLI, cron)
  and the log line simply omits the prefix.
