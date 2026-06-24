# Spec: 5008 — Ashby field-name fallbacks (public job-board API) (formerly Spec 750)

| Field | Value |
| --- | --- |
| Spec ID | 5008 |
| Slug | ashby-field-name-fallbacks |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 719, 5007 |

## Problem

The Ashby plugin's public path reads the unauthenticated job-board endpoint
(`https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true`),
but maps three fields by their authenticated Posting API names. The public
job-board payload names the same fields differently:

| DTO field | Plugin read (authenticated name) | Public job-board name |
| --- | --- | --- |
| `datePosted` | `publishedDate` | `publishedAt` (ISO timestamp) |
| `department` | `departmentName` | `department` |
| `team` | `teamName` | `team` |

Because the public payload never carries `publishedDate`, `departmentName`, or
`teamName`, every job scraped through the public path emits `null` for
`datePosted`, `department`, and `team`. A harvest of 1789 live jobs across 39
Ashby boards confirmed a 100% null rate for all three fields. The earlier
comparison harness missed this because the private Python probe read the same
authenticated names, so both sides agreed on `null` (a false match).

## Scope

- In the Ashby job mapper, read each affected field by its public name first and
  fall back to the authenticated name, so both the public and authenticated
  paths populate.
- `datePosted` resolves `publishedAt ?? publishedDate`, then takes the date part
  of the ISO value (existing behavior).
- `department` resolves `department ?? departmentName ?? null`.
- `team` resolves `team ?? teamName ?? null`.
- Document both name variants in the `AshbyJob` type.

## Contracts

The mapper prefers the public name and falls back to the authenticated name:

| Payload contains | Resulting DTO value |
| --- | --- |
| `departmentName` only | authenticated value |
| `department` only | public value |
| both | public value (preferred) |
| neither | `null` |
| `publishedAt` (ISO timestamp) | date part, e.g. `2026-06-04` |
| `publishedDate` only | date part |

## Non-goals

- Change `JobPostDto`, `LocationDto`, or any shared model shape.
- Re-do multi-location, `isRemote`, or `workFromHomeType` handling (Spec 5007).
- Map `workplaceType` or other currently-unmapped fields.
- Touch non-Ashby ATS plugins.

## Test plan

- Add Ashby tests proving the authenticated names still map (regression guard).
- Add Ashby tests proving the public names (`department`, `team`, `publishedAt`)
  map correctly.
- Add an Ashby test proving the public names win when both are present.
- Run the focused Ashby Jest suite and TypeScript build validation.
- Update the private ATS field investigator to read the public names with
  authenticated fallbacks so future comparisons are trustworthy.
