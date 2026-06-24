# Spec: 5016 — BambooHR detail-fetch overlay + work-mode, compensation, jobType, type-shape fixes (formerly Spec 758)

| Field | Value |
| --- | --- |
| Spec ID | 5016 |
| Slug | bamboohr-detail-fields-mappings |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 720, 5004, 5010, 5012, 5013, 5014, 5015 |

## Problem

A fresh harvest of 9 live BambooHR boards (atkinsonaeronautics 12, avidbots 13,
geospectrum 24, satellogic 16, cleanenergycounsel 4, ppcsolar 4,
carolinasolarservices 3, keyindustries 1, deepisolation 1 — 78 jobs total)
gap-checked against the `makedeeply` BambooHR plugin surfaced one whole class of
structurally-null fields plus several type-shape bugs on the **public** path
(the authenticated `scrapeWithApi` path already maps these correctly but needs
`BAMBOOHR_API_KEY`, which is out of scope).

1. **description / datePosted / compensation are null on 100% of jobs.** The
   public `mapJob` read `job.description`, `job.compensation`, and
   `job.minimumExperience` straight off `/careers/list`, but the live list
   payload does not contain those keys at all. They exist only on the per-job
   `/careers/{id}/detail` endpoint (`result.jobOpening`), which the plugin never
   fetched. So those reads were always `undefined`.
2. **work mode is discarded.** Both list and detail carry `locationType`
   (0 = on-site, 1 = remote, 2 = hybrid; on the 78-job harvest: 55 on-site,
   10 remote, 13 hybrid). `workFromHomeType` was never set and `isRemote` was
   hardcoded `false` (the list `isRemote` boolean is null in practice, so
   `locationType` is the real signal).
3. **jobType / employmentType are never mapped.** Both payloads carry
   `employmentStatusLabel` (`Full-Time` / `Contract` / `Part-Time`).
4. **Type-shape bugs.** `BambooHRJob.id` was typed `number` but the live value
   is a string (`"13"`); `description`/`compensation`/`minimumExperience` were
   declared on the list type but are absent (dead reads); `location` was typed
   `{ city, state, country }` but the live list `location` has only
   `{ city, state }` — country lives in `atsLocation.country`, so the
   `job.location.country` read was always null.

## Scope

- **Detail-fetch overlay.** After loading the list, overlay each job (the
  `resultsWanted` slice) with its `/careers/{id}/detail` payload under bounded
  concurrency (`BAMBOOHR_DETAIL_CONCURRENCY = 5`, `Promise.allSettled`,
  Rippling/Workday/Workable/BreezyHR pattern), aligned by index. A failed/empty
  detail fetch yields `null` so the job still maps from the list (fail-safe).
- **description** from detail `description` (HTML), rendered via
  `descriptionFormat` (HTML passthrough / `htmlToPlainText` / `markdownConverter`
  default).
- **datePosted** from detail `datePosted` (already an ISO `YYYY-MM-DD` date).
- **compensation** from detail's free-text `compensation` via the shared
  `extractSalary` + `getCompensationInterval` (29% carry a parseable range:
  `$160,000+`, `$120,000 - $140,000`, `$19.00 - $27.00 / hr`).
- **workFromHomeType / isRemote** from `locationType` (1 → Remote, 2 → Hybrid,
  0/other → none); `isRemote` = `locationType === 1` (OR'd with any explicit
  `isRemote` boolean for safety).
- **jobType / employmentType** via `getJobTypeFromString(employmentStatusLabel)`
  into `jobType`; `employmentType` from the label text.
- **Type-shape fixes.** `id: string | number`; drop the dead list reads; split
  the shared `BambooHRLocation` (`{ city, state }`) from `BambooHRAtsLocation`
  (where `country` actually lives); add a `BambooHRJobDetail` /
  `BambooHRDetailResponse` for the detail envelope.

## Non-goals

- **No `parseLocationList`.** Unlike the prior ATSes, BambooHR returns full
  state names (`North Carolina`, not `NC`) and keeps country in a separate
  `atsLocation` field. The shared parser is built for `City, ST` + free text and
  would collapse `Lumberton, North Carolina, United States` into a single `city`
  string, losing the structured state. The structured pieces are mapped directly
  instead (`city`/`state` from `location`, `country` from `atsLocation.country`,
  detail preferred over list). Remote-only jobs (no city) get `city: 'Remote'`
  to match the output shape other ATSes produce.
- **No authenticated-path change.** `scrapeWithApi`/`mapApiJobOpening` already
  read description/compensation/location correctly; untouched.
- **No change to other ATS plugins** (per owner).

## Contracts

| Input | description | datePosted | compensation | work mode | jobType / employmentType | location |
| --- | --- | --- | --- | --- | --- | --- |
| detail `description` HTML | rendered body (per format) | — | — | — | — | — |
| detail fetch fails / empty | null | null | omitted | from list `locationType` | from list label | from list |
| detail `datePosted` "2026-04-02" | — | "2026-04-02" | — | — | — | — |
| detail `compensation` "$120,000 - $140,000" | — | — | 120000–140000 USD yearly | — | — | — |
| detail `compensation` "$19.00 - $27.00 / hr" | — | — | 19–27 USD hourly | — | — | — |
| detail `compensation` "Competitive" / absent | — | — | omitted | — | — | — |
| `locationType` 1 | — | — | — | `workFromHomeType=Remote`, `isRemote=true` | — | `city='Remote'` when none |
| `locationType` 2 | — | — | — | `workFromHomeType=Hybrid`, `isRemote=false` | — | — |
| `locationType` 0 | — | — | — | none, `isRemote=false` | — | — |
| `employmentStatusLabel` "Full-Time" / "Contract" | — | — | — | — | `[FULL_TIME]` / `[CONTRACT]` + label | — |
| list `location {city, state}` + `atsLocation {country}` | — | — | — | — | — | `city`/`state`/`country` populated |

## Test plan

- `npx jest source-ats-bamboohr` — suite green.
- Cases: full detail overlay (description + comp + datePosted); `locationType`
  1/2/0 → workFromHomeType + isRemote; jobType/employmentType mapping; structured
  location (full state name + atsLocation country); fail-safe detail error still
  maps the job (description null) without nuking the batch; compensation null on
  unparseable text; hourly comp interval; markdown rendering; jobUrl from
  `jobOpeningShareUrl` with constructed fallback; `resultsWanted` slice bounds
  detail fetches; no companySlug / list-fetch failure → empty.
