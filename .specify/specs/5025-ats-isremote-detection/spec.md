# Spec: 5025 — ATS `isRemote` under-detection (greenhouse offices, workday remoteType)

| Field | Value |
| --- | --- |
| Spec ID | 5025 |
| Slug | ats-isremote-detection |
| Status | draft |
| Owner | agent |
| Created | 2026-06-28 |
| Last updated | 2026-06-28 |
| Related specs | 5024 |

## Problem

The fetch1 Phase 1 ATS regression (alt-path probe vs ever-jobs plugin, run
2026-06-28 over 135 companies) found **8 jobs** where the source payload marks
the role remote but the plugin emits `isRemote: false` — a false negative. Split
**7 greenhouse + 1 workday**:

| Host | Domain | Title |
| --- | --- | --- |
| greenhouse | archer.com | Aerospace Software Certification Engineer |
| greenhouse | navierboat.com | Head of Defense |
| greenhouse | navierboat.com | Head of Mobility |
| greenhouse | navierboat.com | MBA Internship |
| greenhouse | skyryse.com | Lead, Government Affairs |
| greenhouse | vannevarlabs.com | Engineering Manager, Mission Agents |
| greenhouse | vatnsystems.com | Business Development Manager |
| workday | zekelman.com | Technical Sales Representative |

### What the comparison actually checks

Both sides are derived from the **same live ATS API response** pulled at run
time; the STATUS file is **not** the reference (it only routes which board to
fetch and which plugin to run, and carries no `is_remote` column). The two sides:

- **Probe** (`investigate_ats_fields.py`) reads the source's own remote signal:
  - greenhouse — `is_remote = any("remote" in label)` over
    `location.name` **plus every `offices[].name`** (py ~484–493).
  - workday — `"remote"` appears in the concrete locations **plus**
    `remoteType` (`info.remoteType` / `listing.remoteType`) (py ~800–809).
- **Plugin** computes its own `isRemote` from the location text it chooses to
  parse.

So a diff here means the plugin's input/heuristic dropped a remote signal the
source actually carries.

### Root cause

**Greenhouse (7/8) — `offices[]` is never inspected.** `processJob` parses remote
from the single posting location only:

```ts
// greenhouse.service.ts:118–123
// "use location.name as the single source and only fall back to offices
//  when it is missing"
const parsedLocations = parseLocationList(
  this.locationLabels(job.location?.name ?? job.offices?.[0]?.name ?? null),
);
// ...
isRemote: parsedLocations.remoteMentioned,
```

Greenhouse frequently expresses remote as a **dedicated office entry** rather
than in `location.name` — e.g. the job's `offices[]` contains
`Remote - Washington, DC` / `Remote - BRA - Sao Paulo` while `location.name` is a
city (`Washington, D.C.`, `São Paulo, …`). Because the plugin reads `offices[]`
only when `location.name` is **absent**, every remote-via-office job is reported
on-site. `parseLocationList`/`parseLocationText` already flag remote correctly
(`/\bremote\b/i`, location-parser.ts:157) — the labels carrying the signal simply
never reach it. The probe reads `location.name` + all `offices[].name`, so it
sees the signal.

**Workday (1/8) — `remoteType` not populated on the path that had it.** The
workday plugin already ORs `remoteType` into the decision
(workday.service.ts:230–235), so this is not a missing-heuristic bug but a
**field-population gap**: for `zekelman.com` the source exposed the remote signal
at `detail.jobPostingInfo.remoteType` (+ locations text), but the plugin's
`info.remoteType` / `listing.remoteType` resolved empty for that job. The fix
needs to confirm the plugin maps `remoteType` (and the `locationsText` remote
phrasing) from the same response fields the source populates.

This is **not** a fork regression — it is pre-existing detection behaviour, the
same class of "the plugin uses a narrower input than the source carries" issue
that Spec 5024 fixed for `datePosted`.

## Scope

1. **Greenhouse remote signal from `offices[]`.** Compute `isRemote` /
   `workFromHomeType` from the **union** of the posting-location labels and every
   `offices[].name`, so an office-level `Remote - X` entry is detected. The
   primary `location` DTO selection is unchanged (still `location.name`-first);
   only the remote/work-from-home determination widens its input.
2. **Workday `remoteType` population.** Verify and, if needed, fix that the
   plugin reads `remoteType` from the same response field the source exposes
   (`jobPostingInfo.remoteType`) and that the `locationsText` remote phrasing
   feeds `parsedLocations`. No change to the already-correct OR logic.
3. **Tests.** Greenhouse: a job whose `location.name` is a city and whose
   `offices[]` carries `Remote - …` reports `isRemote: true` (today: false).
   Workday: a job exposing `remoteType: "Remote"` reports `isRemote: true`.
   Regression cases drawn from the 8 above.

## Non-goals

- No change to `parseLocationList` / `parseLocationText` remote regexes — they
  already detect `remote`/`hybrid` correctly; this spec only widens what each
  plugin feeds them and how workday populates `remoteType`.
- No change to the singular primary `location` chosen for a posting (the plugin
  keeps `location.name`-first; we are not adding multi-location output here).
- No change to other ATS plugins (ashby/lever/rippling matched on `is_remote`).
- No fetch1 changes (the probe is the reference; it is already correct here).

## Contracts

- `JobPostDto.isRemote: boolean` and `workFromHomeType` shape unchanged — only
  the value is corrected for remote-via-office (greenhouse) and
  remote-via-`remoteType` (workday) postings.
- No new dependency; no plugin imports another plugin; remote/work-from-home
  logic stays in `@ever-jobs/common` (`parseLocationList`).

## Test plan

- **Greenhouse service** — fixture: `location.name = "São Paulo, …"`,
  `offices = [{ name: "Remote - BRA - Sao Paulo" }]` → `isRemote: true`,
  `workFromHomeType: "Remote"`; a purely on-site fixture stays `false`
  (no over-detection from an unrelated office).
- **Workday service** — fixture with `jobPostingInfo.remoteType = "Remote"` and a
  city location → `isRemote: true`; a `remoteType: "Field/Customer Site"` fixture
  stays `false`.
- `npm run build` (whole-graph typecheck) + the two plugin suites green.

## Provenance / evidence

- Regression evidence: `reports_fetch1/ats-phase1.json` (8 `is_remote`
  differences, all `expected=True actual=False`); summarized in
  `docs_fetch1/ats-phase1-findings.md` (fetch1).
- Code: `greenhouse.service.ts:118–123,150`; `workday.service.ts:229–240`;
  `packages/common/src/utils/location-parser.ts:145–206,213–…`.
