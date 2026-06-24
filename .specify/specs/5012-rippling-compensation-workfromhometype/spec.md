# Spec: 5012 — Rippling compensation, workFromHomeType, multi-location (formerly Spec 754)

| Field | Value |
| --- | --- |
| Spec ID | 5012 |
| Slug | rippling-compensation-workfromhometype |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 5003, 5005, 5007, 5010 |

## Problem

A fresh 246-job harvest across 15 Rippling boards (gap-checked against the
`makedeeply` plugin, which already fixes descriptions via Specs 5003/747)
surfaced three field-mapping gaps:

1. **Compensation is null on 100% of jobs**, broken two independent ways:
    - `enrichJobFromDetail` copies only description/applyUrl/companyName/
      createdOn/employmentType from the detail payload. It never copies
      `payRangeDetails`, so `processJob` reads `undefined`.
    - Even when present, `extractCompensation` and the `RipplingPayRangeDetail`
      type read `min_value`/`max_value`/`interval`, but the live payload uses
      `rangeStart`/`rangeEnd`/`frequency` (`YEAR` 61, `HOUR` 10; all USD).

    Compensation lives in two sources: the structured `payRangeDetails` field
    (68/246 ≈ 28%) and the free-text description body (pay-transparency law;
    ~91% mention salary). The plugin reads neither today.

2. **workFromHomeType is never set.** Rippling carries a per-location
   `workplaceType` (ON_SITE 232, REMOTE 10, HYBRID 3) that the plugin ignores.

3. **Multi-location is dropped.** `processJob` uses `locations[0]` only, so
   secondary sites are lost (2 list-side, 8 detail-side jobs affected).

## Scope

- **Type fix.** Correct `RipplingPayRangeDetail` to the live shape
  (`rangeStart`/`rangeEnd`/`frequency`, per-band `location` label, `isRemote`).
- **Enrich payload.** Copy `payRangeDetails`, `locations`, and `workLocations`
  from the detail API response in `enrichJobFromDetail`.
- **Compensation (structured-first, text-fallback).**
    - Read `payRangeDetails` when present.
    - Collapse multiple bands into a **min–max envelope**: `minAmount =
      min(rangeStart)`, `maxAmount = max(rangeEnd)` across all bands.
    - When bands carry **distinct** ranges (by location, work mode, or role
      level), preserve the per-band detail in `salarySource`, semicolon-joined
      (e.g. `Oakland, CA 130,000–200,000; Sandy, UT 115,000–155,000`). Identical
      ranges emit no `salarySource`.
    - When `payRangeDetails` is empty/null, fall back to `extractSalary` over
      the description body text (the shared `@ever-jobs/common` parser).
- **workFromHomeType.** Derive from per-location `workplaceType`
  (HYBRID → `Hybrid`, REMOTE → `Remote`, both → `Hybrid or Remote`,
  ON_SITE → none), else from the parsed location labels.
- **Multi-location.** Route all location labels through the shared
  `parseLocationList` (Ashby/Greenhouse/Lever pattern) for `location`,
  `isRemote`, and `workFromHomeType`.

## Non-goals

- No text-fallback for Ashby/Greenhouse/Lever in this PR (separate follow-up).
- No change to description formatting (Specs 5003/747 already handle it).
- No country fold-in: Rippling serves full country names already.
- No discovery-side slug fix for the 3 boards harvested with the placeholder
  slug `embed` (forterra, typeoneenergy, beehive-industries).

## Contracts

| Input (payRangeDetails / workplaceType) | compensation | salarySource | workFromHomeType |
| --- | --- | --- | --- |
| single band 109k–137k YEAR | yearly 109000–137000 | (none) | per location |
| Oakland 130k–200k; Sandy 115k–155k | yearly 115000–200000 | `Oakland, CA 130,000–200,000; Sandy, UT 115,000–155,000` | per location |
| two bands, identical 140k–160k | yearly 140000–160000 | (none) | per location |
| empty + body "Base Salary Range $109,000–$137,000 per year" | yearly 109000–137000 | (none) | per location |
| structured present + body range | structured wins | per structured | per location |
| workplaceType HYBRID | — | — | `Hybrid` |
| workplaceType REMOTE | — | — | `Remote` (isRemote true) |
| workplaceType ON_SITE | — | — | (none) |

## Test plan

- `npx jest source-ats-rippling` — all suites green (16 → 26 tests).
- New cases: single structured band; hourly frequency; distinct bands →
  envelope + semicolon `salarySource`; identical bands → no `salarySource`;
  text fallback; structured-preferred-over-text; hybrid/remote workFromHomeType;
  multi-location join via `parseLocationList`.
- `npm run build` (tsc) and `npm run lint:docs` green.
