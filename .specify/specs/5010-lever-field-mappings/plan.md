# Plan: 5010 — Lever compensation, department, multi-location, workFromHomeType, country (formerly Spec 752)

| Field | Value |
| --- | --- |
| Spec ID | 5010 |
| Status | implemented |
| Created | 2026-06-23 |

1. Add a zero-dependency `regionNameFromCode` helper in `@ever-jobs/common` that
   resolves an ISO-3166 alpha-2 code to its English name via the native
   `Intl.DisplayNames` (memoized, `fallback: 'none'`, guarded for non-2-letter
   and unassigned codes), and export it from the common utils barrel.
2. Extend `LeverJob` types with `categories.department` and a `salaryRange`
   `{min, max, currency, interval}` shape.
3. Consolidate the public and authenticated paths onto a shared `buildJobPost`
   that maps all four fields plus the country fold-in.
4. Add `extractCompensation` + `resolveInterval` mapping `salaryRange` to a
   `CompensationDto`, extracting the unit from the `per-<unit>-<kind>` token and
   resolving via the shared `getCompensationInterval` (real interval honored).
5. Add `locationLabels` (prefer `allLocations`, fall back to `location`) and
   route it through `parseLocationList`; source `location`, `isRemote`, and
   `workFromHomeType` from its result.
6. Add `workFromHomeTypeFromWorkplace` + `mergeWorkFromHomeType` to set
   `workFromHomeType` from `workplaceType` merged with the parser's inference.
7. Add `applyCountry` to fold the alpha-2 `country` into `LocationDto.country`
   only when the parser left it bare.
8. Map `department ← categories.department`.
9. Add focused Lever unit tests covering each behavior.
10. Run the focused Lever Jest suite and the TypeScript build.
11. Update the private ATS field investigator to emit Lever `department` and
    `compensation`.
12. Update `docs/log.md` (newest at top) and `docs/index.md`, then run doc-lint.

## Packages touched

- `packages/common` (new `country-name` helper, barrel export).
- `packages/plugins/source-ats-lever` (service, types, tests).

## Dependencies

- No new runtime dependencies. Reuses `parseLocationList` from
  `@ever-jobs/common`, `getCompensationInterval` / `CompensationDto` /
  `CompensationInterval` from `@ever-jobs/models`, and the native
  `Intl.DisplayNames` (Node ≥ 18, repo targets Node 22).

## Risks

- `Intl.DisplayNames` output can drift slightly across Node/ICU versions
  (e.g. "Türkiye" vs "Turkey"). Confined to one swappable helper; acceptable for
  display and never used as a dedupe key.
- The `per-<unit>` regex assumes Lever's token shape; unknown tokens fall back to
  `getCompensationInterval`'s own resolution rather than throwing.
