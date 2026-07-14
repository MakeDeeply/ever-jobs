# Plan 1677 — Workable Company-Source Pipeline

| Field | Value |
| --- | --- |
| Spec | spec.md |
| Created | 2026-07-06 |
| Last updated | 2026-07-06 |

## Approach

Clone the proven Recruitee pipeline (Spec 1593), adapting only the Workable
backend specifics:

- **Public API**: `https://apply.workable.com/api/v1/widget/accounts/<slug>`
  (shared host, slug in path — like Greenhouse, unlike Recruitee).
- **Wire shape**: `{ jobs: [...] }` widget envelope.
- **Stable per-job id**: `shortcode` (fallback `code`).
- **id prefix**: `workable-` → `<slug>-`.
- **Board display name**: absent on the widget wire → `boardName = ''`.

Four scripts make up the pipeline, each a pure/testable unit that fans out
without contention:

1. `probe-workable-company-source.ts` — live discovery gate (pure `gateBoard` /
   `extractListings` / `boardUrl`, bounded-concurrency worker pool).
2. `assemble-workable-batch.ts` — join survivors + factual enrichment →
   descriptor batch; derive `className`/`moduleName`/`serviceName`/`enumKey`/
   `slug` from the display name; reject collisions.
3. `scaffold-workable-company-source.ts` — pure file emitter for each
   `source-company-<slug>` package + its spec/plan/tasks.
4. `wire-company-source.ts` (reused, backend-agnostic) — the only script that
   edits the four shared wiring files.

## Files (foundation)

| File | Change |
|------|--------|
| `scripts/probe-workable-company-source.ts` | New probe. |
| `scripts/__tests__/probe-workable-company-source.spec.ts` | New probe unit suite (21 tests). |
| `scripts/scaffold-workable-company-source.ts` | New scaffolder. |
| `scripts/assemble-workable-batch.ts` | New descriptor assembler. |
| `.specify/specs/1677-workable-company-source-pipeline/` | This spec/plan/tasks. |

## Verification

- `npx jest scripts/__tests__/probe-workable-company-source.spec.ts` — 21/21 green.
- End-to-end smoke: assemble → scaffold → wire → per-plugin jest green.
- CI green on push.

## Discovery cadence

Each subsequent run assembles a candidate-slug list (a parallel brainstorm
workflow proposes real Workable-hosted companies per sector×region cell),
live-probes it, and lands the survivors as a contiguous spec band. Blind
brand-guessing hits ~5%; sector-targeted candidates raise the survivor rate.
