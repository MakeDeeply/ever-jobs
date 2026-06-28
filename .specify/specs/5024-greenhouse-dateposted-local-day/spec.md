# Spec: 5024 — Greenhouse `datePosted` keeps the source local day

| Field | Value |
| --- | --- |
| Spec ID | 5024 |
| Slug | greenhouse-dateposted-local-day |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-28 |
| Last updated | 2026-06-28 |
| Related specs | 5009 |

## Problem

The fetch1 Phase 1 ATS regression (alt-path probe vs `source-ats-greenhouse`
plugin, run 2026-06-28 over 135 companies) found a consistent `date_posted`
discrepancy on every Greenhouse posting made in the evening US time: 30/30 such
jobs reported a date **one day later** than the source.

Greenhouse returns `first_published` (public board) / `opened_at` (Harvest) as
an ISO-8601 timestamp **with an explicit offset**, e.g.
`2026-04-20T22:32:33-04:00`. The plugin reduced it to a date with:

```ts
new Date(datePosted).toISOString().split('T')[0]
```

`toISOString()` first shifts the instant to **UTC** (`2026-04-21T02:32:33Z`) and
only then truncates, so the calendar day rolls forward to `2026-04-21`. The
posting's own day (the 20th) is lost for anything published after ~20:00 ET.

This is a long-standing upstream behaviour (introduced 2026-02-08, commit
`b0cd2db4`, "feat: add more sources"), not a fork regression. The same
`new Date(x).toISOString().split('T')[0]` pattern appears in ~227 plugin files,
so it is the house convention rather than a greenhouse-specific bug.

## Scope

1. **Shared helper** `toDateOnly(value)` in `@ever-jobs/common`
   (`converters/date-converter.ts`): for an ISO-8601 string, preserve the
   leading `YYYY-MM-DD` (the calendar day as written in the timestamp's own
   offset); for non-ISO inputs (epoch number, `Date`, other formats) fall back
   to the historical UTC truncation; `null`/empty/invalid → `null`.
2. **Wire `source-ats-greenhouse`** — both the public-board (`processJob`,
   `first_published`) and Harvest-API (`opened_at`) paths use `toDateOnly`.
3. **Tests** — a helper-level suite and a greenhouse service test proving an
   evening offset timestamp keeps the source day.

## Non-goals

- No sweep of the other ~226 files using the same UTC-truncation pattern. This
  spec fixes the case the regression actually caught (greenhouse) and lands a
  reusable helper; a follow-up can adopt `toDateOnly` across the remaining
  plugins. (See `docs/questions.md` is **not** opened — this is a flagged
  follow-up, not an ambiguity.)
- No change to which source field is chosen (`first_published` → `updated_at`,
  `opened_at` → `created_at` → `updated_at` ordering is unchanged).
- No fetch1 changes.

## Contracts

- `toDateOnly(value: string | number | Date | null | undefined): string | null`
  exported from `@ever-jobs/common`.
- `JobPostDto.datePosted` stays a `YYYY-MM-DD` string or `null` — shape
  unchanged; only the day value is corrected for offset timestamps.
- No new dependency; no plugin imports another plugin.

## Test plan

- **Helper** — evening negative-offset and morning positive-offset timestamps
  keep their local day; bare date passes through; `Z` stays on its UTC day;
  epoch/`Date` fall back to UTC day; `null`/`''`/invalid → `null`.
- **Greenhouse service** — a posting with
  `first_published: 2026-04-20T22:32:33-04:00` reports `datePosted` `2026-04-20`
  (previously `2026-04-21`).
