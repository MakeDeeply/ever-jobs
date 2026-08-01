# Tasks: 5074 — JSON-LD `JobPosting` additional fields

> Status legend: `[ ]` pending • `[~]` in-progress • `[x]` done • `[-]` dropped

## Phase 1 — Shared parser extensions

- [ ] T01 — Extend `JobPostingLd` and `mapJobPosting` in `@ever-jobs/common`
  - **Files:** `packages/common/src/utils/jsonld.ts`, `packages/common/__tests__/jsonld.spec.ts`
  - **Acceptance:**
    - `atsId` read from `identifier.value` (any `name`) and `additionalProperty` `jobId`/`reqId`/`atsId`/`id`
    - `applyUrl` resolved from `potentialAction.target.url`/`urlTemplate`, `applicationContact.url`, `additionalProperty.applyUrl`
    - `skills` read from array or comma-separated string
    - `experienceRange` read from `additionalProperty.experienceRange` or plain-string `experienceRequirements`
    - `department`, `team`, `workFromHomeType` read from `additionalProperty`
    - `workFromHomeType` normalized to `Remote`/`Hybrid`/`Onsite`
    - `remote` boolean respects `workFromHomeType` override of `jobLocationType: TELECOMMUTE`
  - **Estimate:** 0.5 day

## Phase 2 — `source-jsonld` plugin mapping

- [ ] T02 — Map new `JobPostingLd` fields to `JobPostDto`
  - **Files:** `packages/plugins/source-jsonld/src/jsonld.service.ts`, `packages/plugins/source-jsonld/__tests__/jsonld.service.spec.ts`
  - **Acceptance:**
    - `processPosting` sets `atsId`, `skills`, `department`, `team`, `experienceRange`, `workFromHomeType`, `isRemote`, `applyUrl`
    - `workFromHomeType: HYBRID` + `jobLocationType: TELECOMMUTE` yields `isRemote: false`
  - **Estimate:** 0.5 day

## Phase 3 — Docs and cross-references

- [ ] T03 — Update `docs/index.md` and `docs/log.md`
  - **Files:** `docs/index.md`, `docs/log.md`
  - **Acceptance:** index lists Spec 5074; log describes the parser/plugin changes
  - **Estimate:** 0.25 day

## Notes

- Write tests alongside each implementation task; do not batch testing into a final task.
- Update `docs/log.md` with each completed task in the same commit.
