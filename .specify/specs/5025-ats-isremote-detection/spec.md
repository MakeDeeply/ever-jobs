# Spec: 5025 — Workday `isRemote` detects slugified `Remote_*` locations

| Field | Value |
| --- | --- |
| Spec ID | 5025 |
| Slug | ats-isremote-detection |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-28 |
| Last updated | 2026-06-28 |
| Related specs | 5013, 5009 |

## Problem

The fetch1 Phase 1 ATS regression (alt-path probe vs the ever-jobs plugins, run
2026-06-28 over 135 companies) flagged 8 jobs where the probe reported
`is_remote=true` but the plugin emitted `false` (7 greenhouse + 1 workday).

Ground-truthing every case against the rendered posting page (recorded in the
fetch1 doc `ats-isremote-detection-SPEC.md`) showed the 7 greenhouse cases are
**probe over-detection**: the remote token lives only in the internal
`offices[]` taxonomy, never on the applicant-facing page, so the greenhouse
plugin's `location.name`-only behaviour is correct and is left unchanged (this
also matches the resolved decision in `greenhouse-plugin-field-gaps` not to fold
`offices[]` into `isRemote`).

The **one genuine plugin under-detection** is workday — zekelman
`Technical Sales Representative` (jobReqId `JR002273`). Its location is literally
`Remote_USA` (externalPath `/job/Remote_USA/…`, `locationsText: "Remote_USA"`),
yet the plugin emitted `isRemote: false`. Cause: the workday service routes the
location labels through the shared `parseLocationList`, whose remote check is
`/\bremote\b/i`. In `Remote_USA` the underscore is a word character, so the
`\b` boundary after `Remote` never matches and `remoteMentioned` stayed `false`.

## Scope

1. In `source-ats-workday` (`workday.service.ts`), normalize underscores to
   spaces in each location label before passing them to `parseLocationList`
   (e.g. `Remote_USA` → `Remote USA`), then collapse whitespace. This restores
   the word boundary so the shared parser detects remote and produces a clean
   location string.

## Non-goals

- **Greenhouse `offices[]`** — no change; `location.name` remains the single
  source. Folding `offices[]` in would over-detect on the 5 office-only cases.
- **Description-text remote** (navier MBA Internship, vannevar Eng Mgr — the
  signal is only in the job-description body, e.g. "Remote-friendly role") —
  deferred to a separate investigation; not addressed here.
- **fetch1 probe** — the probe's over-detection from greenhouse `offices[]` is
  fixed in the fetch1 repo, not here.

## Contracts

- `JobPostDto.isRemote` / `JobPostDto.location` shape unchanged; the fix only
  corrects detection for underscore-slugged remote location labels.
- No new dependency; no change to the shared `parseLocationList` regexes; no
  plugin imports another plugin.

## Test plan

- **Workday service** — a list-only posting with `locationsText: "Remote_USA"`
  and an unavailable detail (matching the live case) yields `isRemote: true` and
  a location whose city contains no underscore. Existing workday suites stay
  green (behaviour-preserving for labels without underscores).
