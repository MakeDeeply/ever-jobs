# Tasks: 5016 — BambooHR detail-fetch overlay + work-mode, compensation, jobType, type-shape fixes (formerly Spec 758)

1. [x] Add `bamboohrListUrl`, `bamboohrDetailUrl`, and
       `BAMBOOHR_DETAIL_CONCURRENCY` to `bamboohr.constants.ts` (keep the
       existing `BAMBOOHR_CAREERS_URL` and `BAMBOOHR_HEADERS`).
2. [x] Fix `bamboohr.types.ts`: `BambooHRJob.id: string | number`; drop the dead
       `description`/`compensation`/`minimumExperience` list reads; split
       `BambooHRLocation` from `BambooHRAtsLocation`; add `locationType` +
       `isRemote`; add `BambooHRJobDetail` and `BambooHRDetailResponse`.
3. [x] Import `extractSalary` (`@ever-jobs/common`) and `getJobTypeFromString`/
       `getCompensationInterval`/`CompensationDto` (`@ever-jobs/models`) plus the
       new constants/types into the service.
4. [x] In `scrape()`, slice to `resultsWanted`, overlay each job with its detail
       via `fetchDetails` before mapping, and pass the aligned detail +
       `descriptionFormat` into `mapJob`.
5. [x] Add `fetchDetails` (batched `Promise.allSettled`, index-aligned, fail-safe
       null) and `fetchDetail` (single GET of `/careers/{id}/detail`, return
       `result.jobOpening`).
6. [x] Add `formatDescription` (render per `descriptionFormat`),
       `workFromHomeTypeFromLocationType`, `buildLocation`, and
       `extractCompensation` (`extractSalary` + `getCompensationInterval`).
7. [x] Rewrite `mapJob` to take `detail`: set description, datePosted,
       compensation, workFromHomeType, isRemote, jobType, employmentType,
       location, jobUrl (`jobOpeningShareUrl` fallback), department.
8. [x] Leave the authenticated `scrapeWithApi`/`mapApiJobOpening` path untouched.
9. [x] Add `bamboohr.service.spec.ts` covering the overlay, work-mode mapping,
       jobType, structured location, fail-safe, compensation, rendering, jobUrl,
       resultsWanted bounds, and empty/error paths.
10. [x] Run `npx jest source-ats-bamboohr`, `npm run build`, `npm run lint:docs`;
        update `docs/index.md` + `docs/log.md`.
