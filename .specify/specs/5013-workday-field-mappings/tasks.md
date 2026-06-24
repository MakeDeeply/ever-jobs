# Tasks: 5013 — Workday compensation, workFromHomeType, multi-location, country, datePosted (formerly Spec 755)

1. [x] Expose `startDate`, `additionalLocations`, `remoteType`,
       `jobRequisitionLocation.country.alpha2Code` in `workday.types.ts`.
2. [x] Add imports: `CompensationDto`, `getCompensationInterval`,
       `extractSalary`, `parseLocationList`, `regionNameFromCode`.
3. [x] Route `[location, ...additionalLocations, locationsText]` through
       `parseLocationList`; drop the bare "N Locations" count.
4. [x] Add `applyCountry`; fold `alpha2Code` via `regionNameFromCode` when the
       parser left country bare.
5. [x] Add `workFromHomeTypeFromRemoteType`; set `workFromHomeType` from
       `remoteType` else parsed labels.
6. [x] Prefer `startDate` over `postedOn` for `datePosted` (both via
       `parseWorkdayPostedOn`).
7. [x] Add `extractCompensationFromText` via `extractSalary`; set
       `compensation` on the DTO. Drop the unused `mergeLocations`.
8. [x] Extend unit tests (10 new cases: comp from text, null comp,
       Hybrid/Remote + isRemote, on-site none, multi-location join, "N Locations"
       dropped, country fold-in, country unset, startDate-first, label fallback).
9. [x] `npx jest source-ats-workday`, `npm run build`, `npm run lint:docs`.
10. [x] Update `docs/log.md` and `docs/index.md`.
11. [ ] Commit, push feature branch, open PR against `makedeeply`.
