# Plan: 1137 — Source Company Plugin: Overview Energy (Ashby company-direct)

| Field | Value |
| --- | --- |
| Spec | spec.md |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |

## Approach

Clone the proven `source-company-allencontrolsystems` Ashby-delegation pattern
via `scripts/scaffold-ashby-company-source.ts`. The service is a thin
registry-delegating adaptor — no bespoke HTTP or parsing — so it inherits every
Ashby field fix. Registration is applied by the backend-agnostic
`scripts/wire-company-source.ts`.

## Files

| File | Change |
|------|--------|
| `packages/plugins/source-company-overviewenergy/*` | New package (module, service, index, tests, fixture). |
| `packages/models/src/enums/site.enum.ts` | `+ OVERVIEW_ENERGY = 'overviewenergy'`. |
| `packages/plugins/index.ts` | `+ import OverviewEnergyModule` + `ALL_SOURCE_MODULES` entry. |
| `tsconfig.base.json` | `+` path alias. |
| `jest.config.js` | `+` moduleNameMapper entry. |
| `.specify/specs/1137-source-company-overviewenergy/` | This spec/plan/tasks. |

## Verification

- `tsc --noEmit` clean for the new package.
- Mocked unit suite green (no live network).
- Optional: live probe against `https://api.ashbyhq.com/posting-api/job-board/overviewenergy`.
