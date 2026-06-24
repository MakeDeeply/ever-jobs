# Spec: 5015 — BreezyHR location fix + detail-page description, compensation, jobType (formerly Spec 757)

| Field | Value |
| --- | --- |
| Spec ID | 5015 |
| Slug | breezyhr-location-detail-description |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 720, 5004, 5010, 5012, 5013, 5014 |

## Problem

A fresh harvest of all 3 BreezyHR boards (ondas-networks 1, vvater-llc 24,
zeno-power 22 — 47 jobs total) gap-checked against the `makedeeply` BreezyHR
plugin surfaced one real bug and three missing field mappings.

1. **Location is built wrong → literal `[object Object]`.** The plugin pushed
   `listing.location.state` and `.country` onto a string array, but on the
   public `/json` list those are objects (`{ id, name }`), not strings. The
   joined result became `"Austin, [object Object], [object Object]"`, which was
   then crammed into `LocationDto.city` — `state`/`country` were never set.
2. **`description` is null on 100% of jobs.** The list endpoint
   (`https://{slug}.breezy.hr/json`) carries no body text. The posting body
   lives only on the per-job detail page (`/p/{friendly_id}`), inside a
   schema.org `JobPosting` ld+json block (rich HTML). The plugin never fetched
   it. There is no plain per-job JSON endpoint — `/json/{id}` variants
   302-redirect to the company root.
3. **`compensation` is never read.** The list carries a free-text `salary`
   range (22/47 = 47%, clean format: `$105k - $125k`, `$19.00 - $27.00 / hr`).
4. **`jobType` / `employmentType` are never mapped.** The list carries
   `type` (`{ id: "fullTime"|"contract", name: "Full-Time"|"Contract" }`).

## Scope

- **Location fix.** Read the structured pieces (`city`, `state.name`,
  `country.name`, accepting either object or bare-string shapes) and route the
  labels through the shared `parseLocationList` (Lever/Rippling/Workday/Workable
  convention) so `city`/`state`/`country` are populated correctly and multi-loc
  is handled. Fall back to a minimal structured `LocationDto` (then to the
  pre-joined `location.name`) only when the parser yields nothing.
- **Detail-page description.** After loading the list, overlay each job with the
  description parsed from its public detail page under bounded concurrency
  (`BREEZYHR_DETAIL_CONCURRENCY = 5`, `Promise.allSettled`, Rippling/Workday/
  Workable pattern). Fetch `/p/{friendly_id}` (HTML), extract the
  `<script type="application/ld+json">` block whose `@type` is `JobPosting`, and
  read its `description`. Render via `descriptionFormat` (HTML passthrough /
  `htmlToPlainText` / `markdownConverter` default). A failed/empty fetch yields
  `null` so the job still maps from the list (fail-safe).
- **compensation.** Parse the list's free-text `salary` via the shared
  `extractSalary` and honor the real interval (`getCompensationInterval`):
  yearly USD for `k`, hourly USD for `/hr`.
- **jobType / employmentType.** Map `getJobTypeFromString(type.id ?? type.name)`
  into `jobType`; set `employmentType` from `type.name`.

## Non-goals

- **No workFromHomeType.** No structured work-mode anywhere: ld+json
  `jobLocationType` is null on all sampled jobs and `location.is_remote` is false
  on all 47. Nothing reliable to map.
- **No isRemote broadening.** Already mapped from `location.is_remote` (false on
  all 47 in this harvest); the location-label `remoteMentioned` signal from
  `parseLocationList` is OR'd in for free, but there is nothing else to widen
  against here.
- **No multi-location-specific work.** `locations[]` exists but 0 harvested jobs
  carry >1 entry; the parser handles it generically if it ever does.
- **No change to other ATS plugins** (per owner).

## Contracts

| Input | location | description | compensation | jobType / employmentType |
| --- | --- | --- | --- | --- |
| list `location {city, state{name}, country{name}}` | parsed `city`/`state`/`country`, no `[object Object]` | — | — | — |
| detail `JobPosting` ld+json with `description` | — | rendered body (per format) | — | — |
| detail fetch fails / no ld+json | — | null | — | — |
| list `salary` "$105k - $125k" | — | — | 105000–125000 USD yearly | — |
| list `salary` "$19.00 - $27.00 / hr" | — | — | 19–27 USD hourly | — |
| list `salary` empty/absent | — | — | omitted | — |
| list `type {id:"fullTime", name:"Full-Time"}` | — | — | — | `[FULL_TIME]` / "Full-Time" |
| list `type {id:"contract", name:"Contract"}` | — | — | — | `[CONTRACT]` / "Contract" |

## Test plan

- `npx jest source-ats-breezyhr` — suite green.
- Cases: structured location (no `[object Object]`); detail ld+json description
  (markdown default); `descriptionFormat` HTML + plain; yearly comp; hourly comp;
  jobType/employmentType mapping (fullTime + contract); detail-fetch failure
  still maps core fields (description null); `isRemote` from `location.is_remote`;
  compensation omitted when no salary.
- `npm run build` (tsc) and `npm run lint:docs` green.
