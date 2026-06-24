# Spec: 5010 — Lever compensation, department, multi-location, workFromHomeType, country (formerly Spec 752)

| Field | Value |
| --- | --- |
| Spec ID | 5010 |
| Slug | lever-field-mappings |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 5006, 5007, 5008, 5009 |

## Problem

A harvest of 1116 live jobs across 21 Lever boards
(`https://api.lever.co/v0/postings/{slug}?mode=json`) showed the Lever plugin's
descriptions and field names are already correct (Specs 5006/749), but four
fields the public payload carries are never mapped to the DTO:

1. **Compensation never mapped (832/1116 = 75%).** The payload carries
   `salaryRange` `{min, max, currency, interval}`; the plugin emits
   `compensation = null` on every job. Interval tokens observed:
   `per-year-salary` (718), `per-hour-wage` (113), `per-month-salary` (1).
2. **Department never mapped (1035/1116 = 93%).** The payload carries
   `categories.department` (distinct from `categories.team`, e.g.
   department `Manufacturing` / team `CNC`); only `team` is mapped.
3. **Multi-location dropped (171 jobs).** Lever carries every site in
   `categories.allLocations[]`, but the plugin reads only the single
   `categories.location` and dumps it verbatim into `LocationDto.city`.
4. **`workFromHomeType` never set (226 hybrid, 21 remote).** The payload carries
   `workplaceType` (`onsite`/`hybrid`/`remote`); `workFromHomeType` is never set
   and `isRemote` is only partially inferred.

Separately, Lever carries an ISO-3166 alpha-2 `country` code (~15 distinct codes
in the harvest: US, AU, GB, NL, JP, IN, AE, TW, UA, PL, …) that never reaches
`LocationDto.country`.

## Scope

- Map `salaryRange` to `CompensationDto`, honoring the real interval (not
  coercing to yearly): extract the unit from the `per-<unit>-<kind>` token and
  resolve it through the shared `getCompensationInterval`.
- Map `categories.department` to `department` (independent of `team`).
- Route the posting location through the shared `parseLocationList`, preferring
  `categories.allLocations` (multi-site) and falling back to the single
  `categories.location`, so `location` (with `;`-joined labels), `isRemote`, and
  `workFromHomeType` come from the shared helper.
- Set `workFromHomeType` from `workplaceType` (`hybrid` → `Hybrid`, `remote` →
  `Remote`) merged with anything the location parser inferred; mark `isRemote`
  true when `workplaceType` is `remote` or the parser saw a remote mention.
- Fold Lever's alpha-2 `country` code into `LocationDto.country` via a new
  zero-dependency `regionNameFromCode` helper (native `Intl.DisplayNames`), but
  only when the location parser did not already derive a country.
- Apply the same mapping to both the public and authenticated paths (they return
  the same posting shape from the same endpoint).

## Contracts

| Payload condition | Resulting DTO value |
| --- | --- |
| `salaryRange` `{20.14, 24.9, USD, per-hour-wage}` | `compensation = {hourly, USD, 20.14–24.9}` |
| `salaryRange` `{…, per-year-salary}` | `compensation.interval = yearly` |
| `salaryRange` `{…, per-month-salary}` | `compensation.interval = monthly` |
| no `salaryRange` (or no min/max) | `compensation = null` |
| `categories.department = Manufacturing`, `team = CNC` | `department = "Manufacturing"`, `team = "CNC"` |
| `allLocations = [Nashua, NH; Brooklyn Park, MN]` | `city = "Nashua, NH; Brooklyn Park, MN"` |
| `workplaceType = hybrid` | `workFromHomeType = "Hybrid"`, `isRemote = false` |
| `workplaceType = remote` | `workFromHomeType = "Remote"`, `isRemote = true` |
| `country = NL` (parser left country bare) | `location.country = "Netherlands"` |
| `country = QZ` (unassigned) | `location.country` unchanged |

## Non-goals

- Change `JobPostDto`, `LocationDto`, or `CompensationDto`, or any shared model.
- Add a country library dependency; the alpha-2 → name lookup uses the native
  CLDR-backed `Intl.DisplayNames` confined to one `@ever-jobs/common` helper.
- Coerce all pay periods to yearly; real intervals are honored.
- Reverse (name → code) country lookup; Lever only ever hands us alpha-2 codes.
- Re-derive descriptions or field names already correct on `makedeeply`.

## Test plan

- Add a test proving `salaryRange` maps to `CompensationDto` with the real
  interval for per-hour, per-year, and per-month tokens.
- Add a test proving missing `salaryRange` yields `compensation = null`.
- Add a test proving `categories.department` maps independently of `team`.
- Add a test proving multi-site `allLocations` join into one `LocationDto`.
- Add tests proving `workplaceType` hybrid/remote set `workFromHomeType` and
  `isRemote` correctly.
- Add tests proving a resolvable alpha-2 `country` folds into the location and an
  unresolvable code is ignored.
- Run the focused Lever Jest suite and the TypeScript build.
- Update the private ATS field investigator to emit Lever `department` and
  `compensation` so future comparisons are trustworthy.
