# Plan: 5012 — Rippling compensation, workFromHomeType, multi-location (formerly Spec 754)

| Field | Value |
| --- | --- |
| Spec ID | 5012 |
| Status | implemented |
| Created | 2026-06-23 |

## Phases

1. **Type correction.** Rewrite `RipplingPayRangeDetail` in `rippling.types.ts`
   to the live payload shape (`location`, `currency`, `frequency`,
   `rangeStart`, `rangeEnd`, `isRemote`).

2. **Detail enrichment.** In `enrichJobFromDetail`, copy `payRangeDetails`,
   `locations`, and `workLocations` from the detail response when non-empty
   (the board list omits structured pay/locations on most boards).

3. **Compensation rewrite.** Replace `extractCompensation`:
    - Filter bands with a usable `rangeStart`/`rangeEnd`.
    - Envelope: `min(rangeStart)` / `max(rangeEnd)`; interval + currency from
      the first band.
    - `salarySource` only when `>1` distinct `rangeStart-rangeEnd` pair, joined
      with `; ` via `formatPayBand` (`<label> <start>–<end>`, en-dash, grouped
      thousands).
    - Add `extractCompensationFromText`: plain-text the description body, run
      `extractSalary`, map to `CompensationDto`.
    - `processJob` prefers structured, falls back to text.

4. **Work mode + location.** Add `locationLabels`, `hasRemoteWorkplaceType`,
   `workFromHomeTypeFromWorkplaceType`. Route labels through `parseLocationList`;
   set `location`, `isRemote`, `workFromHomeType`, and `salarySource` on the DTO.

5. **Tests + docs.** Extend the unit suite; update spec triad + `docs/log.md` +
   `docs/index.md`.

## Packages touched

- `packages/plugins/source-ats-rippling` (types, service, tests).
- No change to `@ever-jobs/common` or `@ever-jobs/models` (reuses existing
  `extractSalary`, `parseLocationList`, `getCompensationInterval`).

## Risks

- **Text parser false positives.** `extractSalary` can mis-read prose numbers;
  mitigated by its currency/country guards and structured-first ordering.
- **Envelope hides per-band detail.** Mitigated by emitting `salarySource` for
  distinct bands.
- **`Intl`-free** — no locale risk; `toLocaleString('en-US')` is deterministic
  for grouping.
