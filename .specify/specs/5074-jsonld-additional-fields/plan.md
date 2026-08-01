# Plan: 5074 — JSON-LD `JobPosting` additional fields

| Field        | Value                              |
| ------------ | ---------------------------------- |
| Spec         | spec.md                            |
| Created      | 2026-07-30                         |
| Last updated | 2026-07-30                         |

## 1. Approach

Extend the shared `parseJobPostingLd` helper in `@ever-jobs/common` to read the standard schema.org fields and `additionalProperty` extensions it currently ignores, then surface those values through `JobPostingLd`. Update the `source-jsonld` plugin's `processPosting` to map the new `JobPostingLd` fields into the existing `JobPostDto` shape. Add unit tests for both the shared parser and the plugin mapping.

## 2. Phases

### Phase 1 — Shared parser extensions

- Goal: update `JobPostingLd` and `mapJobPosting` in `packages/common/src/utils/jsonld.ts` to populate `atsId`, `skills`, `experienceRange`, `department`, `team`, `workFromHomeType`, and the `applyUrl` fallbacks.
- Deliverables: helper functions for `identifier`, `additionalProperty` lookup, `skills` normalization, `experienceRequirements`, and `workFromHomeType`/`remote` resolution.
- Exit criteria: `packages/common/__tests__/jsonld.spec.ts` covers every new field and passes.

### Phase 2 — `source-jsonld` plugin mapping

- Goal: pass the new `JobPostingLd` fields into `JobPostDto` in `packages/plugins/source-jsonld/src/jsonld.service.ts`.
- Deliverables: `processPosting` sets `atsId`, `skills`, `department`, `team`, `experienceRange`, `workFromHomeType`, `isRemote`, and `applyUrl` from the posting.
- Exit criteria: `packages/plugins/source-jsonld/__tests__/jsonld.service.spec.ts` passes with new assertions.

### Phase 3 — Docs and cross-references

- Goal: record the spec in the canonical index and log.
- Deliverables: `docs/index.md` and `docs/log.md` updated.
- Exit criteria: `docs/index.md` lists Spec 5074; `docs/log.md` describes the change.

## 3. Packages Touched

| Package                          | Change                                  |
| -------------------------------- | --------------------------------------- |
| `packages/common`                | `JobPostingLd` + parser helpers         |
| `packages/plugins/source-jsonld` | map new fields to `JobPostDto`          |
| `docs/`                          | index, log                              |

## 4. Dependencies

(none)

## 5. Risks & Mitigations

| Risk                                             | Likelihood | Impact | Mitigation                                      |
| ------------------------------------------------ | ---------- | ------ | ----------------------------------------------- |
| `additionalProperty` shapes vary in the wild     | medium     | low    | read `name`/`value` defensively; skip non-objects |
| `experienceRequirements` may be an object        | low        | low    | only read it when it is a plain string          |

## 6. Rollback Plan

Revert the two source files and their tests. `JobPostDto` fields already existed, so no data migration is needed.

## 7. Migration Plan

No data migration. Existing jobs are unaffected; new harvests will populate the additional fields when present.

## 8. Open Questions for Plan

(none)
