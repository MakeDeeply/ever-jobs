# Plan: 5013 — Workday compensation, workFromHomeType, multi-location, country, datePosted (formerly Spec 755)

| Field | Value |
| --- | --- |
| Spec ID | 5013 |
| Status | implemented |
| Created | 2026-06-23 |

## Phases

1. **Types.** Add `startDate`, `additionalLocations`, `remoteType`, and
   `jobRequisitionLocation.country.alpha2Code` to the `jobPostingInfo` shape in
   `workday.types.ts` so the service can read them.

2. **Imports.** Pull `CompensationDto` + `getCompensationInterval` from
   `@ever-jobs/models`, and `extractSalary`, `parseLocationList`,
   `regionNameFromCode` from `@ever-jobs/common`.

3. **processListing rewrite.** Replace the `mergeLocations`-based block:
    - Build the label list `[location, ...additionalLocations, locationsText]`,
      dropping the bare "N Locations" count, and route through
      `parseLocationList` for `location`, `isRemote`, `workFromHomeType`.
    - Fold the requisition `alpha2Code` into the parsed location via
      `applyCountry` when the parser left country bare.
    - Set `workFromHomeType` from `remoteType` (`workFromHomeTypeFromRemoteType`),
      else from the parsed labels.
    - Set `datePosted` from `parseWorkdayPostedOn(startDate)` first, falling back
      to `parseWorkdayPostedOn(postedOn)`.
    - Set `compensation` from `extractCompensationFromText` over the description
      body.

4. **Helpers.** Add `applyCountry`, `workFromHomeTypeFromRemoteType`, and
   `extractCompensationFromText`; drop the now-unused `mergeLocations`.

5. **Tests + docs.** Extend the unit suite; update spec triad + `docs/log.md` +
   `docs/index.md`.

## Packages touched

- `packages/plugins/source-ats-workday` (types, service, tests).
- No change to `@ever-jobs/common` or `@ever-jobs/models` (reuses existing
  `extractSalary`, `parseLocationList`, `regionNameFromCode`,
  `getCompensationInterval`).

## Risks

- **Text parser false positives.** `extractSalary` can mis-read prose numbers;
  mitigated by its currency/country guards. Workday has no structured pay source,
  so text is the only option (additive — comp was null before).
- **city/state split changes existing DTO shape.** Previously `city` held the
  whole merged string; now multi-site joins via `parseLocationList` and
  single-site splits city/state. Existing Workday tests updated to match the
  more-correct contract.
- **`Intl.DisplayNames` locale drift.** Confined to the single
  `regionNameFromCode` helper (Spec 5010); only used to fill an otherwise-empty
  country.
