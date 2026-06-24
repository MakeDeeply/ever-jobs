# Plan: 5015 — BreezyHR location fix + detail-page description, compensation, jobType (formerly Spec 757)

| Field | Value |
| --- | --- |
| Spec ID | 5015 |
| Status | implemented |
| Created | 2026-06-23 |

## Phases

1. **Constants.** Add `breezyListUrl(slug)` + `breezyDetailUrl(slug, friendlyId)`
   builders and `BREEZYHR_DETAIL_CONCURRENCY` (`5`, Rippling/Workable precedent)
   to a new `breezyhr.constants.ts`.

2. **Types.** Add `breezyhr.types.ts`: `BreezyJob` (list record, with `location`
   whose `state`/`country` are `{id,name}` objects, `type`, `salary`), a
   `BreezyLocation` node, and `BreezyJobPostingLd` for the schema.org block.

3. **Imports.** Pull `parseLocationList`, `extractSalary`, `htmlToPlainText`,
   `markdownConverter` from `@ever-jobs/common`; `getJobTypeFromString`,
   `getCompensationInterval`, `CompensationDto`, `DescriptionFormat` from
   `@ever-jobs/models`; plus the new constants/types.

4. **scrape() overlay.** After slicing to `resultsWanted`, call
   `fetchDescriptions(client, listings, slug)` to fetch each job's detail page
   under bounded concurrency, then pass the aligned description + the input
   `descriptionFormat` into `processJob`.

5. **processJob mapping.** Add `descriptionHtml` + `format` params; set
    - `location` via `parseLocationList(locationLabels(listing))` (fallback to a
      minimal structured `LocationDto`, then `location.name`),
    - `description` via `formatDescription(descriptionHtml, format)`,
    - `compensation` via `extractCompensation(listing.salary)`,
    - `jobType` via `getJobTypeFromString(type.id ?? type.name)`,
    - `employmentType` from `type.name`,
    - `isRemote` = `location.is_remote` OR parser `remoteMentioned`.

6. **Helpers.** Add `fetchDescriptions` (batched `Promise.allSettled`,
   index-aligned, fail-safe null), `fetchDescription` (single GET of the detail
   page, warn + null on error), `descriptionFromHtml` (regex out the ld+json
   blocks, JSON.parse, return the `JobPosting` `description`), `formatDescription`
   (render per format), `locationLabels` (build `city, state, country` labels),
   `nodeName` (object-or-string accessor), `fallbackLocation`, and
   `extractCompensation` (`extractSalary` + `getCompensationInterval`).

## Packages touched

- `packages/plugins/source-ats-breezyhr` (new constants + types, rewritten
  service, new test suite).
- No change to `@ever-jobs/common` or `@ever-jobs/models` (reuses existing
  `parseLocationList`, `extractSalary`, `getJobTypeFromString`,
  `getCompensationInterval`, `htmlToPlainText`, `markdownConverter`; all target
  `JobPostDto` fields already exist).

## Risks

- **Per-job fetch cost.** One extra request per job for the description. Bounded
  by `BREEZYHR_DETAIL_CONCURRENCY` and capped at `resultsWanted`; goes through
  the shared HTTP client (timeouts, retries, UA rotation). Description is the
  whole point of the detail fetch, so it always runs (matching Workable).
- **ld+json parsing.** The detail page is HTML carrying a structured-data island.
  Parsing selects the `@type === 'JobPosting'` block (skipping any `WebSite`/
  other blocks) and tolerates malformed JSON (try/catch per block). A
  failed/empty fetch nulls only that job's description (`Promise.allSettled`),
  never the batch.
- **Salary free-text parsing.** Reuses the trusted shared `extractSalary`
  (multi-currency, hourly/yearly); verified against all 22 non-empty harvested
  salary strings. Only set when a min/max is found.
