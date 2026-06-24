# Tasks: 5015 — BreezyHR location fix + detail-page description, compensation, jobType (formerly Spec 757)

1. [x] Add `breezyListUrl`, `breezyDetailUrl`, and `BREEZYHR_DETAIL_CONCURRENCY`
       to a new `breezyhr.constants.ts`.
2. [x] Add `BreezyJob`, `BreezyLocation`, and `BreezyJobPostingLd` to a new
       `breezyhr.types.ts`.
3. [x] Import `parseLocationList`/`extractSalary`/`htmlToPlainText`/
       `markdownConverter` (`@ever-jobs/common`) and `getJobTypeFromString`/
       `getCompensationInterval`/`CompensationDto`/`DescriptionFormat`
       (`@ever-jobs/models`) plus the new constants/types into the service.
4. [x] In `scrape()`, overlay each job with its detail-page description via
       `fetchDescriptions` before mapping; pass `descriptionFormat` + aligned
       description into `processJob`.
5. [x] Add `fetchDescriptions` (batched `Promise.allSettled`, index-aligned,
       fail-safe null) and `fetchDescription` (single GET, warn + null on error).
6. [x] Add `descriptionFromHtml` (select the `JobPosting` ld+json block, tolerate
       malformed JSON) and `formatDescription` (render per `descriptionFormat`).
7. [x] Fix location: add `locationLabels`/`nodeName`/`fallbackLocation` and route
       through `parseLocationList` (no more `[object Object]`).
8. [x] Add `extractCompensation` (`extractSalary` + `getCompensationInterval`).
9. [x] In `processJob`, set `location`, `description`, `compensation`, `jobType`
       (`type.id ?? type.name`), `employmentType` (`type.name`), and `isRemote`.
10. [x] Add a service unit suite (9 cases: structured location, detail ld+json
        description markdown, HTML+plain formats, yearly comp, hourly comp,
        jobType/employmentType, detail-fetch failure fallback, isRemote,
        compensation omitted).
11. [x] `npx jest source-ats-breezyhr`, `npm run build`, `npm run lint:docs`.
12. [x] Update `docs/log.md` and `docs/index.md`.
