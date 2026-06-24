# Spec: 5003 — Rippling pagination and job details (formerly Spec 744)

| Field | Value |
| --- | --- |
| Spec ID | 5003 |
| Slug | source-ats-rippling-pagination-and-details |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-21 |
| Last updated | 2026-06-22 |
| Supersedes | (none) |
| Related specs | (none) |

## Problem

The upstream Rippling plugin reads only one board page and assumes list records contain complete
job descriptions. Multi-page boards therefore return incomplete results, and valid jobs commonly
have null descriptions because Rippling exposes the full HTML only through its job-detail API.
Rippling's dehydrated page data can also contain filter records that must never become jobs.

## Scope

- Paginate zero-based Rippling board pages until exhausted or `resultsWanted` is satisfied.
- Deduplicate jobs by stable UUID and reject dehydrated filter records with strict admission rules.
- Enrich missing descriptions from Rippling's public detail API with bounded concurrency.
- Format description HTML as requested and extract emails.
- Complete employment-type, company URL, apply URL, and location fallback mapping.
- Preserve existing compensation extraction and graceful partial-result behavior.
- Update focused Rippling tests.

## Listing and pagination contract

- Request `https://ats.rippling.com/{slug}/jobs?page={page}&jobBoardSlug={slug}` starting at page zero.
- Accept only records with a UUID-shaped `uuid` or `id`, a non-empty `title` or `name`, and at least one job-specific signal: job URL, description, location, department, or employment type.
- Deduplicate by source UUID across pages and preserve first-seen order.
- Stop when `resultsWanted` is satisfied, a page has no jobs, or a page contributes no unseen UUIDs.
- Treat a repeated earlier page as exhaustion so redirects cannot cause an infinite loop.
- Return collected jobs when a later page fails; a first-page failure returns no jobs.
- Missing `companySlug` and `resultsWanted: 0` return no jobs without an HTTP request.
- Missing `resultsWanted` retains the direct-service default of 100; large explicit values have no plugin-specific hard cap.
- Never synthesize an ID or URL containing `undefined`.

## Detail enrichment contract

- When an admitted list record lacks a description, request `GET https://ats.rippling.com/api/v2/board/{slug}/jobs/{uuid}`.
- Do not request details for rejected records, duplicate UUIDs, or jobs whose list record already contains a description.
- Use the shared HTTP client and process at most five detail requests simultaneously.
- Preserve list-derived fields, especially structured location data; merge only detail fields needed for description and a distinct apply URL.
- A failed or malformed detail response leaves the otherwise valid job in the result with a null description and logs a job-specific warning.
- Detail failure for one job must not abort other jobs or the complete scrape.

## Description contract

- Rippling detail `description.company` and `description.role` are HTML components.
- Join non-empty components in company-then-role order with one blank line.
- `DescriptionFormat.HTML`: preserve the source HTML.
- `DescriptionFormat.MARKDOWN` or unspecified: use `markdownConverter()`.
- `DescriptionFormat.PLAIN`: use `htmlToPlainText()`.
- Run `extractEmails()` against the final formatted description.

## Final output changes

- Set `companyUrl` to `https://ats.rippling.com/{slug}/jobs`.
- Keep the source-specific listing URL in `jobUrl`.
- Emit `applyUrl` only when Rippling supplies a distinct value; do not copy `jobUrl` into it.
- Do not populate `companyUrlDirect` or `jobUrlDirect`.
- Normalize `employmentType.label` with `getJobTypeFromString()`:
    - A mapped label emits only `jobType`.
    - A meaningful unmapped label emits only the original `employmentType`.
- Build `location` from the first structured location, falling back from city to name, state to state code, country to country code, and finally to the first non-empty `workLocations` value.
- Derive remote status from structured workplace type or remote text in `workLocations`.
- Preserve existing department, date, ATS metadata, compensation, and stable ID mapping.

## Files changed

- `packages/plugins/source-ats-rippling/src/rippling.constants.ts`
- `packages/plugins/source-ats-rippling/src/rippling.types.ts`
- `packages/plugins/source-ats-rippling/src/rippling.service.ts`
- `packages/plugins/source-ats-rippling/__tests__/rippling.service.spec.ts`

## Non-goals

- Dedup-engine changes outside the Rippling source.
- Browser automation or Rippling UI search/filter support.
- Generic HTML detection.
- Changes to shared DTOs or other source plugins.
- Changes outside this repository.

## Test plan

- Fetch multiple zero-based pages, preserve URL order, and stop on empty or repeated pages.
- Deduplicate repeated UUIDs, retain unseen later-page jobs, and return partial results after later-page failure.
- Verify explicit large result counts are not capped at 100.
- Reject filter arrays and prevent bogus `undefined` jobs.
- Fetch a missing description from the detail endpoint and skip unnecessary detail requests.
- Verify HTML, Markdown, and plain description formats plus email extraction.
- Preserve a job after detail failure and enforce the five-request concurrency bound.
- Verify mapped and unmapped employment types, company/apply URLs, and every location fallback.
