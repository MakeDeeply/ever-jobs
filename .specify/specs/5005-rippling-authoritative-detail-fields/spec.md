# Spec: 5005 — Rippling authoritative detail fields (formerly Spec 747)

| Field | Value |
| --- | --- |
| Spec ID | 5005 |
| Slug | rippling-authoritative-detail-fields |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-22 |
| Last updated | 2026-06-22 |
| Related specs | 5003 |

## Problem

Rippling list records are not authoritative for every output field. On Boom Supersonic's board,
the public job-detail response supplies `companyName: "Boom Technology, Inc."`, `createdOn`, and
`employmentType.label`, but the plugin skips the detail request whenever the list record already
has a description. It consequently emits the list's alternate company label and omits the posted
timestamp and raw employment-type label.

## Scope

- Fetch the public detail record for every admitted, deduplicated job selected for output.
- Prefer non-empty detail `companyName`, `createdOn`, and `employmentType` values over list values.
- Preserve list values independently when a detail field is absent, blank, malformed, or the
  detail request fails.
- Preserve Rippling's complete `createdOn` string, including time and UTC offset.
- Emit the raw `employmentType.label` in `employmentType`; additionally emit normalized `jobType`
  when the shared mapper recognizes the label.
- Retain Spec 5003's bounded concurrency, ordering, description formatting, and graceful failure.

## Contracts

For each selected UUID, request
`GET https://ats.rippling.com/api/v2/board/{slug}/jobs/{uuid}` with at most five requests active.
Merge detail fields into the corresponding list record without allowing absent detail properties
to erase usable list data. Detail values win for the three fields in scope.

Output mappings:

| Detail path | Output field | Contract |
| --- | --- | --- |
| `detail.companyName` | `companyName` | Non-empty source value; list value then slug fallback |
| `detail.createdOn` | `datePosted` | Preserve the complete non-empty source string |
| `detail.employmentType.label` | `employmentType` | Preserve the trimmed source label |
| `detail.employmentType.label` | `jobType` | Also emit when shared normalization recognizes it |

## Non-goals

- Changes to Rippling pagination, identity, compensation, or location behavior.
- Shared DTO or job-type alias changes.
- Changes to other ATS plugins.
- Browser automation or private Rippling APIs.

## Test plan

- Prove that a list job with an existing description still requests its detail record.
- Prove Boom's detail identity replaces the list identity.
- Assert the full offset-bearing `createdOn` value is preserved.
- Assert `SALARIED_FT` is emitted as raw `employmentType`.
- Assert mapped labels emit both raw `employmentType` and normalized `jobType`.
- Preserve list fallbacks after detail failure and enforce the five-request concurrency bound.

