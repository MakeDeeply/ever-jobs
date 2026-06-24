# Spec: 5013 — Workday compensation, workFromHomeType, multi-location, country, datePosted (formerly Spec 755)

| Field | Value |
| --- | --- |
| Spec ID | 5013 |
| Slug | workday-field-mappings |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 720, 5004, 5010, 5012 |

## Problem

A fresh harvest of 2754 jobs across all 7 Workday boards (1116 with CXS detail;
gevernova/GE Vernova detail-throttled and excluded from analysis) gap-checked
against the `makedeeply` Workday plugin surfaced five field-mapping gaps:

1. **Compensation is null on 100% of jobs.** Unlike Rippling/Lever, the Workday
   CXS API exposes **no structured pay field at all** — the only salary signal
   is the pay-transparency range in the description body text (explicit `$X–$Y`
   on 340/1116 ≈ 30%). The plugin reads neither.
2. **workFromHomeType is never set.** The detail payload carries `remoteType`
   (`Hybrid`, `Fully Remote`, `Remote Eligible`, `Field/Customer Site`) that the
   plugin ignores.
3. **Multi-location is dropped.** The plugin merges `location` +
   `additionalLocations` (158 jobs) into one string dumped into `city`; it never
   splits city/state/country, and the bare `locationsText` "N Locations" count
   leaks in as a location.
4. **Country is never set.** `jobRequisitionLocation.country.alpha2Code` ("US")
   is present on 1116/1116 detail records but never mapped.
5. **datePosted is lossy.** The plugin parses the relative `postedOn` label
   ("Posted 30+ Days Ago" → null; "Posted 5 Days Ago" → drifts on re-scrape),
   while the detail carries an absolute `startDate` (ISO) that tracks the label
   exactly on every record.

## Scope

- **Compensation (text-only fallback).** Workday has no structured field, so run
  the shared `extractSalary` over the description body text and map the result
  into `CompensationDto`, honoring the real interval (yearly/hourly).
- **workFromHomeType.** Derive from `remoteType` (contains "hybrid" → `Hybrid`,
  contains "remote" → `Remote`; on-site values → none), else from the parsed
  location labels.
- **Multi-location.** Route `[location, ...additionalLocations, locationsText]`
  through the shared `parseLocationList` (Ashby/Greenhouse/Lever/Rippling
  pattern) for `location`, `isRemote`, and `workFromHomeType`. Drop the bare
  "N Locations" count so the parser never treats it as a place.
- **Country.** Fold `jobRequisitionLocation.country.alpha2Code` into
  `LocationDto.country` via the zero-dep `regionNameFromCode` helper (Spec 5010),
  only when the parser did not already derive one.
- **datePosted.** Prefer the absolute `startDate`, falling back to the relative
  `postedOn` label only when `startDate` is missing. Both flow through the same
  validated ISO/relative parser, so the raw label can never leak.

## Non-goals

- No text-fallback for Ashby/Greenhouse/Lever in this PR (separate follow-up).
- No department fix: Workday CXS exposes no department/job-family on these 7
  boards. The existing `jobFamily`/subtitle reads stay (valid on other tenants).
- No change to description formatting (real HTML; no Greenhouse entity bug).
- No harvest-side change to recover gevernova's throttled detail coverage.

## Contracts

| Input | compensation | workFromHomeType | location | datePosted |
| --- | --- | --- | --- | --- |
| body "...range is $120,000 - $150,000 per year" | yearly 120000–150000 USD | — | — | — |
| body with no salary | null | — | — | — |
| `remoteType` "Hybrid" | — | `Hybrid` | — | — |
| `remoteType` "Fully Remote" | — | `Remote` (isRemote true) | — | — |
| `remoteType` "Field/Customer Site" | — | (none) | — | — |
| location + additionalLocations | — | — | `Rockville, MD; Oak Ridge, TN` | — |
| `locationsText` "2 Locations" only | — | — | null (count dropped) | — |
| `alpha2Code` "US" | — | — | country `United States` | — |
| `startDate` 2026-05-20 + "Posted 30+ Days Ago" | — | — | — | `2026-05-20` |
| no startDate + "Posted Today" | — | — | — | today's ISO date |

## Test plan

- `npx jest source-ats-workday` — all suites green (35 → 45 tests).
- New cases: compensation from body text; null when no salary; remoteType →
  Hybrid/Remote (+ isRemote); on-site remoteType → none; multi-location join via
  `parseLocationList`; "N Locations" count dropped; country fold-in via
  `regionNameFromCode`; country unset when no alpha2Code; startDate-first
  datePosted; relative-label fallback when startDate missing.
- `npm run build` (tsc) and `npm run lint:docs` green.
