# Plan: 5024 — Greenhouse `datePosted` keeps the source local day

| Field | Value |
| --- | --- |
| Spec ID | 5024 |
| Status | implemented |
| Created | 2026-06-28 |

## Phases

1. **Shared helper** — add `packages/common/src/converters/date-converter.ts`
   exporting `toDateOnly`; re-export from `converters/index.ts` (already barreled
   into `@ever-jobs/common`).
2. **Wire greenhouse** — import `toDateOnly` in
   `packages/plugins/source-ats-greenhouse/src/greenhouse.service.ts`; replace
   both `new Date(datePosted).toISOString().split('T')[0]` expressions
   (`processJob` public board + `processHarvestJob` Harvest API) with
   `toDateOnly(datePosted)`.
3. **Tests** — `packages/common/__tests__/date-converter.spec.ts` and a new case
   in `packages/plugins/source-ats-greenhouse/__tests__/greenhouse.service.spec.ts`.

## Packages touched

- `@ever-jobs/common` (new helper + test)
- `@ever-jobs/source-ats-greenhouse` (wire + test)

## Risks

- **Behaviour change**: offset timestamps now resolve to a different (correct)
  calendar day than before. This is the intended fix; it only moves the day for
  postings whose UTC day differed from their local day.
- **Bare-date / `Z` inputs**: unchanged (bare date passes through; `Z` keeps its
  UTC day, identical to old behaviour).
- **Scope creep**: the same pattern lives in ~227 files; deliberately out of
  scope here to keep the change reviewable. The helper makes the follow-up sweep
  a one-line swap per file.

## Verification

- `npx jest packages/common/__tests__/date-converter.spec.ts packages/plugins/source-ats-greenhouse`
- `npx tsc --noEmit -p packages/common/tsconfig.json`
- `npx tsc --noEmit -p packages/plugins/source-ats-greenhouse/tsconfig.json`
- `npm run lint:docs`
