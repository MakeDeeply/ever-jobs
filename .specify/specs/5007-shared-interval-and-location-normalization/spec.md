# Spec: 5007 — Shared interval and multi-location normalization (formerly Spec 749)

| Field | Value |
| --- | --- |
| Spec ID | 5007 |
| Slug | shared-interval-and-location-normalization |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 719, 5001, 746 |

## Problem

Ashby public compensation intervals can arrive as source-authored count-one tokens such as
`"1 YEAR"`. Ashby previously handled this with plugin-local string stripping before calling the
shared `getCompensationInterval()` helper. That makes the same unambiguous mapping unavailable to
other plugins and forces the private ATS investigator to know about both raw source forms and
Ever Jobs' canonical DTO interval forms.

Ashby and other ATS platforms also expose duplicate-ish multi-location arrays such as
`Mountain View, CA`, `Mountain View, California, United States`, `Seattle, WA`,
`Seattle, WA, United States`, `Remote`, and `United States`. Individual plugins should not keep
reinventing city/state/country canonicalization, broad country suppression, remote detection, and
semicolon-separated singular-DTO fallback behavior.

## Scope

- Extend `getCompensationInterval()` conservatively so only `1 <known interval unit>` is
  normalized before existing interval lookup.
- Do not drop arbitrary leading digits; values such as `2 weeks` remain unmapped unless a future
  DTO contract defines their semantics.
- Add a shared multi-location helper beside `parseLocationText()` that deduplicates equivalent US
  city/state labels, keeps remote/workplace signals, and suppresses broad country-only labels when
  more specific locations exist.
- Wire Ashby to the shared multi-location helper for primary and secondary locations.
- Update the private ATS field investigator so compensation comparison can use the repository's
  own interval-normalization helper instead of duplicating interval mappings in Python.

## Contracts

### Compensation intervals

`getCompensationInterval()` remains case-insensitive for existing single-token inputs and now also
accepts exactly count-one unit inputs:

| Input examples | Output |
| --- | --- |
| `YEAR`, `year`, `YEARLY` | `yearly` |
| `1 YEAR`, `1 year`, `1 Month`, `1 HOUR` | corresponding canonical interval |
| `2 weeks`, `3 MONTHS`, `NONE` | `null` |

### Multi-location normalization

The shared helper accepts an ordered list of raw labels and returns:

- `location`: the singular `LocationDto` best fitting the current DTO.
- `locations`: deduplicated concrete `LocationDto` entries for callers that need internals.
- `labels`: canonical labels used to build the singular fallback.
- `remoteMentioned`: true when a remote label or qualifier is present.
- `workFromHomeType`: `Remote`, `Hybrid`, `Hybrid or Remote`, or null.

For multiple concrete locations, `location.city` is the semicolon-separated canonical label list
and `location.country` may retain a common country. Example:

`["Mountain View, CA", "Mountain View, California, United States", "Seattle, WA",
"Seattle, WA, United States", "Remote", "United States"]`

maps to:

- `labels`: `["Mountain View, CA", "Seattle, WA"]`
- `location.city`: `Mountain View, CA; Seattle, WA`
- `location.country`: `United States`
- `remoteMentioned`: `true`
- `workFromHomeType`: `Remote`

## Non-goals

- Parse multi-week, biweekly, or arbitrary numeric pay-period semantics.
- Add a plural-count interval contract.
- Add a multi-location array to `JobPostDto`.
- Rewrite non-Ashby ATS plugins in this change.
- Replace the private investigator with TypeScript.

## Test plan

- Add model tests proving `1 YEAR`/mixed-case count-one interval mapping and `2 weeks` rejection.
- Add common tests for duplicate US city/state labels, country-only suppression, remote signals,
  and multiple-location singular fallback.
- Add Ashby tests proving primary + secondary location arrays normalize through the shared helper.
- Run focused model/common/Ashby Jest suites and TypeScript validation.
- Run the private ATS investigator for Ashby domains and iterate until expected canonical interval
  and location mappings do not appear as false positives.
