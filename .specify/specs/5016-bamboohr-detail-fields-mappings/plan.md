# Plan: 5016 — BambooHR detail-fetch overlay + work-mode, compensation, jobType, type-shape fixes (formerly Spec 758)

| Field | Value |
| --- | --- |
| Spec ID | 5016 |
| Status | implemented |
| Created | 2026-06-23 |

## Phases

1. **Constants.** Add `bamboohrListUrl(slug)` + `bamboohrDetailUrl(slug, id)`
   builders and `BAMBOOHR_DETAIL_CONCURRENCY` (`5`, Rippling/Workable/BreezyHR
   precedent) to `bamboohr.constants.ts`. Keep the existing `BAMBOOHR_CAREERS_URL`
   and `BAMBOOHR_HEADERS`.

2. **Types.** Fix `BambooHRJob`: `id: string | number`; drop the dead
   `description`/`compensation`/`minimumExperience` reads; split a shared
   `BambooHRLocation` (`{ city, state, ... }`) from `BambooHRAtsLocation`
   (`{ country, ... }`); add `locationType` and `isRemote`. Add
   `BambooHRJobDetail` (the `result.jobOpening` object) and
   `BambooHRDetailResponse` (the envelope).

3. **Imports.** Pull `extractSalary` from `@ever-jobs/common`;
   `getJobTypeFromString`, `getCompensationInterval`, `CompensationDto` from
   `@ever-jobs/models`; plus the new constants/types.

4. **scrape() overlay.** After slicing to `resultsWanted`, call
   `fetchDetails(client, wanted, slug)` to fetch each job's detail endpoint
   under bounded concurrency, then pass the index-aligned detail + the input
   `descriptionFormat` into `mapJob`.

5. **mapJob mapping.** Add `detail` + keep `format` params; set
    - `description` via `formatDescription(detail.description, format)`,
    - `datePosted` from `detail.datePosted`,
    - `compensation` via `extractCompensation(detail.compensation)`,
    - `workFromHomeType`/`isRemote` via `workFromHomeTypeFromLocationType` +
      `locationType === 1`,
    - `jobType` via `getJobTypeFromString(employmentStatusLabel)`,
    - `employmentType` from the label,
    - `location` via `buildLocation` (structured city/state + atsLocation
      country, detail preferred; `city='Remote'` for remote-only),
    - `jobUrl` from `detail.jobOpeningShareUrl` with a constructed fallback,
    - `department` from `departmentLabel` (list, then detail).

6. **Helpers.** Add `fetchDetails` (batched `Promise.allSettled`, index-aligned,
   fail-safe null), `fetchDetail` (single GET of `/careers/{id}/detail`, return
   `result.jobOpening`), `buildLocation`, `workFromHomeTypeFromLocationType`,
   `formatDescription` (render per format), and `extractCompensation`
   (`extractSalary` + `getCompensationInterval`).

## Packages touched

- `packages/plugins/source-ats-bamboohr` (constants + types updated, service
  rewritten public path, new unit-test suite).
- No change to `@ever-jobs/common` or `@ever-jobs/models` (reuses existing
  `extractSalary`, `getJobTypeFromString`, `getCompensationInterval`,
  `htmlToPlainText`, `markdownConverter`; all target `JobPostDto` fields already
  exist).

## Risks

- **Per-job fetch cost.** One extra request per job for the detail body. Bounded
  by `BAMBOOHR_DETAIL_CONCURRENCY` and capped at `resultsWanted`; goes through
  the shared HTTP client (timeouts, retries, UA rotation). Description/comp/
  datePosted are the whole point, so it always runs (matching Workable/BreezyHR).
- **Fail-safe.** A failed/empty detail nulls only that index
  (`Promise.allSettled`), never the batch; the job still maps from the list.
- **Location.** Deliberately bypasses `parseLocationList` because BambooHR uses
  full state names + a separate `atsLocation.country`; the shared parser would
  collapse them into `city`. Structured-direct mapping preserves `state`.
- **Salary free-text parsing.** Reuses the trusted shared `extractSalary`
  (multi-currency, hourly/yearly); only set when a min/max is found.
