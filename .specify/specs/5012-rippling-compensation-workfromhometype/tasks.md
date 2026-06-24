# Tasks: 5012 — Rippling compensation, workFromHomeType, multi-location (formerly Spec 754)

1. [x] Correct `RipplingPayRangeDetail` shape in `rippling.types.ts`
       (`rangeStart`/`rangeEnd`/`frequency`/`location`/`isRemote`).
2. [x] Copy `payRangeDetails`, `locations`, `workLocations` in
       `enrichJobFromDetail`.
3. [x] Rewrite `extractCompensation`: min–max envelope across bands.
4. [x] Emit `salarySource` (semicolon-joined per-band) only for distinct ranges.
5. [x] Add `extractCompensationFromText` fallback via `extractSalary`; wire
       structured-first preference in `processJob`.
6. [x] Add `locationLabels` + route through `parseLocationList` for
       `location`/`isRemote`.
7. [x] Add `workFromHomeTypeFromWorkplaceType` + `hasRemoteWorkplaceType`; set
       `workFromHomeType` on the DTO.
8. [x] Extend unit tests (10 new cases: structured single/hourly, distinct
       envelope + salarySource, identical no-salarySource, text fallback,
       structured-preferred, hybrid/remote workFromHomeType, multi-location).
9. [x] `npx jest source-ats-rippling`, `npm run build`, `npm run lint:docs`.
10. [x] Update `docs/log.md` and `docs/index.md`.
11. [ ] Commit, push feature branch, open PR against `makedeeply`.
