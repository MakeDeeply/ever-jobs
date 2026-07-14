# Plan: 1377 — Source Company Plugin: Abercrombie & Fitch Co. (SmartRecruiters company-direct)

| Field | Value |
| --- | --- |
| Spec | spec.md |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |

## Approach

Clone the proven registry-delegation pattern via
`scripts/scaffold-smartrecruiters-company-source.ts`. The service is a thin
registry-delegating adaptor — no bespoke HTTP or parsing — so it inherits every
SmartRecruiters field fix. Registration is applied by the backend-agnostic
`scripts/wire-company-source.ts`.

## Files

| File | Change |
|------|--------|
| `packages/plugins/source-company-abercrombiefitchco/*` | New package (module, service, index, tests, fixture). |
| `packages/models/src/enums/site.enum.ts` | `+ ABERCROMBIE_FITCH_CO = 'abercrombiefitchco'`. |
| `packages/plugins/index.ts` | `+ import AbercrombieFitchCoModule` + `ALL_SOURCE_MODULES` entry. |
| `tsconfig.base.json` | `+` path alias. |
| `jest.config.js` | `+` moduleNameMapper entry. |
| `.specify/specs/1377-source-company-abercrombiefitchco/` | This spec/plan/tasks. |

## Verification

- `tsc --noEmit` clean for the new package.
- Mocked unit suite green (no live network).
- Optional: live probe against `https://api.smartrecruiters.com/v1/companies/AbercrombieAndFitchCo/postings?limit=100`.
