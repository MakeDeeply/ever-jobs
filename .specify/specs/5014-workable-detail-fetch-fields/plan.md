# Plan: 5014 — Workable v2 detail fetch: description, workFromHomeType, jobFunction, isRemote (formerly Spec 756)

| Field | Value |
| --- | --- |
| Spec ID | 5014 |
| Status | implemented |
| Created | 2026-06-23 |

## Phases

1. **Constants.** Add `WORKABLE_DETAIL_API_URL`
   (`https://apply.workable.com/api/v2/accounts`), `WORKABLE_DETAIL_CONCURRENCY`
   (`5`, Rippling precedent), and a `workableDetailUrl(slug, shortcode)` builder
   to `workable.constants.ts`.

2. **Types.** Add a `WorkableJobDetail` interface to `workable.types.ts` for the
   v2 detail shape (`shortcode`, `description`, `requirements`, `benefits`,
   `workplace`, `remote`).

3. **Imports.** Pull `htmlToPlainText` + `markdownConverter` from
   `@ever-jobs/common` and the new constants/type.

4. **scrape() overlay.** After slicing to `resultsWanted`, call
   `fetchDetails(client, limited, slug)` to fetch each job's v2 detail under
   bounded concurrency, then pass the aligned detail into `processJob`.

5. **processJob mapping.** Add `format` + `detail` params; set
    - `description` via `formatDescription(detail, format)`,
    - `workFromHomeType` via `workFromHomeTypeFromWorkplace(detail.workplace)`,
    - `jobFunction` from the widget `function`,
    - broadened `isRemote` (widget `telecommuting` OR detail `remote` OR
      `workplace === 'remote'`).

6. **Helpers.** Add `fetchDetails` (batched `Promise.allSettled`, index-aligned,
   fail-safe null), `fetchDetail` (single GET, warn + null on error),
   `formatDescription` (concatenate description/requirements/benefits then render
   per format), and `workFromHomeTypeFromWorkplace` (enum → label).

7. **Tests + docs.** Add a service unit suite with a URL-routed mocked HTTP
   client; update spec triad + `docs/log.md` + `docs/index.md`.

## Packages touched

- `packages/plugins/source-ats-workable` (constants, types, service, tests).
- No change to `@ever-jobs/common` or `@ever-jobs/models` (reuses existing
  `htmlToPlainText`, `markdownConverter`; `description`/`jobFunction`/
  `workFromHomeType` already exist on `JobPostDto`).

## Risks

- **Per-job fetch cost.** One extra request per job. Bounded by
  `WORKABLE_DETAIL_CONCURRENCY` and capped at `resultsWanted`; goes through the
  shared HTTP client (timeouts, retries, UA rotation). Owner chose "always
  fetch" since description is the whole point.
- **Detail-fetch failure.** A failed/empty fetch nulls only that job's detail
  (`Promise.allSettled`), so the job still maps from the widget list — no batch
  nuke.
- **jobFunction convention.** `JobPostDto.jobFunction` is annotated LinkedIn-only;
  owner accepts non-LinkedIn population, with downstream special-casing if needed.
