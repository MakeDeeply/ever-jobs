# Plan: 5025 — ATS `isRemote` under-detection

| Field | Value |
| --- | --- |
| Spec ID | 5025 |
| Status | draft |
| Created | 2026-06-28 |

## Phases

1. **Greenhouse — widen remote input to `offices[]`.**
   In `processJob` (and the Harvest path `processHarvestJob` if it shares the
   pattern), keep the primary `location` DTO as `location.name`-first, but derive
   `isRemote` / `workFromHomeType` from the union of the posting-location labels
   and every `offices[].name`:
   ```ts
   const officeLabels = (job.offices ?? [])
     .map((o) => o?.name)
     .filter((n): n is string => !!n);
   const parsedLocations = parseLocationList([
     ...this.locationLabels(job.location?.name ?? null),
     ...officeLabels,
   ]);
   const primary = parseLocationList(
     this.locationLabels(job.location?.name ?? job.offices?.[0]?.name ?? null),
   ).location;
   // location: primary  (unchanged selection)
   // isRemote: parsedLocations.remoteMentioned  (now sees offices)
   ```
   (Exact shape finalized during implementation; the contract is: primary
   location unchanged, remote/WFH considers offices.)
2. **Workday — confirm `remoteType` population.**
   Trace where `info.remoteType` / `listing.remoteType` are set from the list and
   detail responses; ensure they map from `jobPostingInfo.remoteType` and that
   `locationsText` flows into `parsedLocations`. Fix the mapping if the field is
   read from the wrong path. The OR decision (`remoteType` || parsed labels)
   stays.
3. **Tests** — add greenhouse office-remote + workday remoteType cases (and an
   on-site negative for each to guard against over-detection).

## Packages touched

- `@ever-jobs/source-ats-greenhouse` (remote input widened + tests)
- `@ever-jobs/source-ats-workday` (remoteType population verified/fixed + tests)
- `@ever-jobs/common` — **no change expected** (parser already detects remote);
  touched only if tracing reveals a genuine parser gap.

## Risks

- **Over-detection.** Pulling `offices[]` into the remote decision could flag a
  job remote because of an unrelated company-wide "Remote" office. Mitigation:
  Greenhouse attaches `offices[]` per posting (not the whole company roster), and
  the probe — which we treat as the reference — uses the same union, so plugin
  and source agree. Add an on-site negative test to lock this in.
- **Harvest path divergence.** The Harvest-API path may shape offices/locations
  differently; verify before applying the same change there.
- **Workday single sample.** Only one workday case; confirm the field path on the
  live `zekelman.com` payload (or a captured fixture) before changing mapping, to
  avoid guessing.

## Verification

- `npm run build` (nx whole-graph typecheck) — green.
- `npx jest packages/plugins/source-ats-greenhouse packages/plugins/source-ats-workday`
  — green, including the new remote cases.
- `npm run lint:docs` — green. (`npm run lint` is a no-op in this repo.)

## Open questions

See `docs/questions.md` (Q-5025-a: should an office-only `Remote - X` entry also
surface as a secondary location, given `JobPostDto.location` is singular?).
Default: **no** — only drive the remote flag for now; primary location unchanged.
