# Tasks: 5010 — Lever compensation, department, multi-location, workFromHomeType, country (formerly Spec 752)

- [x] T01 — Add the zero-dependency `regionNameFromCode` helper in `@ever-jobs/common` and export it from the utils barrel.
- [x] T02 — Extend `LeverJob` types with `categories.department` and the `salaryRange` shape.
- [x] T03 — Consolidate the public and authenticated paths onto a shared `buildJobPost`.
- [x] T04 — Map `salaryRange` to `CompensationDto` honoring the real interval via `getCompensationInterval`.
- [x] T05 — Route the posting location through `parseLocationList` (prefer `allLocations`; set `location`, `isRemote`, `workFromHomeType`).
- [x] T06 — Set `workFromHomeType` from `workplaceType` merged with the parser's inference.
- [x] T07 — Fold the alpha-2 `country` into `LocationDto.country` only when the parser left it bare.
- [x] T08 — Map `department ← categories.department`.
- [x] T09 — Add focused Lever tests for compensation, department, multi-location, workFromHomeType, and country.
- [x] T10 — Run the focused Lever Jest suite and the TypeScript build.
- [x] T11 — Update the private ATS field investigator to emit Lever `department` and `compensation`.
- [x] T12 — Update `docs/log.md` and `docs/index.md` and run doc-lint.
