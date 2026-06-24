# Plan: 5020 — Paylocity board-page scrape (replace dead feed API) + detail-fetch overlay

| Field | Value |
| --- | --- |
| Spec ID | 5020 |
| Status | implemented |
| Created | 2026-06-23 |

## Phases

1. **Constants.** Replace `PAYLOCITY_API_BASE` (feed) with `PAYLOCITY_BASE` +
   `paylocityBoardUrl(guid)` (`/recruiting/jobs/All/{GUID}`) and
   `paylocityDetailUrl(guid, jobId)` (`/recruiting/jobs/Details/{JobId}/{GUID}`).
   Add `PAYLOCITY_DETAIL_CONCURRENCY = 5`. Keep `PAYLOCITY_HEADERS` (HTML accept).

2. **Types.** Replace the feed-shaped `PaylocityJob` with `PaylocityPageData`
   (`ModuleTitle`, `Jobs[]`), `PaylocityListJob` (`JobId`, `JobTitle`,
   `LocationName`, `JobLocation`, `HiringDepartment`, `PublishedDate`,
   `IsRemote`, `IndeedRemoteType`), `PaylocityJobLocation`
   (`City`/`State`/`Zip`/`Country`/`Name`), and a parsed `PaylocityJobDetail`
   (`description`, `jobType`).

3. **scrape().** Treat `companySlug` as the GUID. Fetch the board page, parse
   `window.pageData` via a string-aware brace matcher, read `ModuleTitle` +
   `Jobs[]`. Slice to `resultsWanted`, then overlay each job via `fetchDetails`
   (bounded `Promise.allSettled`, index-aligned, fail-safe `null`). Map each via
   `processJob`. Empty/unparseable board or empty slug → `[]`.

4. **parsePageData / parseDetail.** `parsePageData` brace-matches the
   `window.pageData = {...}` object (string/escape aware) → `JSON.parse`.
   `parseDetail` walks the detail page's
   `<div class="job-listing-header">LABEL</div><div>…</div>` blocks: `Job Type`
   → employment type, every other section (Description, Requirements, …) →
   concatenated description HTML (via a balanced `captureFollowingDiv`).

5. **processJob mapping.** title ← `JobTitle`; company ← `ModuleTitle`;
   `location` ← `JobLocation` (city/state/country, `Remote` city fallback);
   `isRemote` ← `IsRemote || IndeedRemoteType === 1`; `workFromHomeType` ←
   `Remote`/`Hybrid`; `department` ← `HiringDepartment`; `datePosted` ←
   `PublishedDate`; `description` ← detail (per `descriptionFormat`); `jobType`
   ← `getJobTypeFromString(detail.jobType)`; `employmentType` ← detail label;
   `compensation` ← `resolveCompensation({ structured: null, text: description })`
   with `salarySource='description'`; `emails` ← `extractEmails`; `jobUrl` ←
   detail URL; `atsId`/`atsType`/`site`/`id` set.

6. **Tests.** New `paylocity.service.spec.ts` driven by 4 committed real
   fixtures (sendcutsend + fermi boards, one detail each), mocked HTTP routed by
   URL. Repurpose `paylocity.e2e-spec.ts` into a network smoke guarded behind an
   env flag (skipped by default) so CI/local runs stay deterministic.

## Packages touched

- `packages/plugins/source-ats-paylocity` (constants + types replaced, service
  rewritten, new fixtures + unit suite).
- No change to `@ever-jobs/common` / `@ever-jobs/models` (reuses
  `resolveCompensation`, `getJobTypeFromString`, `htmlToPlainText`,
  `markdownConverter`, `extractEmails`; all target `JobPostDto` fields exist).

## Risks

- **Per-job fetch cost.** One detail request per job, bounded by
  `PAYLOCITY_DETAIL_CONCURRENCY` and capped at `resultsWanted`; through the
  shared HTTP client (timeouts/retries/UA). Descriptions/jobType/comp only exist
  on the detail page, so the overlay always runs (Workable/BambooHR precedent).
- **Fail-safe.** A failed/empty detail nulls only that index; the job still maps
  from the board list (title/company/location/dept/datePosted/remote).
- **HTML parsing fragility.** Both parsers are defensive (return `null`/`[]` on
  any mismatch). Fixtures are real captured pages, so format drift is caught by
  tests rather than silently producing bad data.
- **Feed not revived.** Documented in `docs/questions.md`; if Paylocity exposes
  a keyed feed later, the structured-first `resolveCompensation` contract and
  the type layer make re-adding it incremental.
