# Plan: 1231 — Source Company Plugin: Centre for Strategic Infocomm Technologies (CSIT) (Lever company-direct)

| Field | Value |
| --- | --- |
| Spec | spec.md |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |

## Approach

Clone the proven registry-delegation pattern via
`scripts/scaffold-lever-company-source.ts`. The service is a thin
registry-delegating adaptor — no bespoke HTTP or parsing — so it inherits every
Lever field fix. Registration is applied by the backend-agnostic
`scripts/wire-company-source.ts`.

## Files

| File | Change |
|------|--------|
| `packages/plugins/source-company-csit/*` | New package (module, service, index, tests, fixture). |
| `packages/models/src/enums/site.enum.ts` | `+ CENTRE_FOR_STRATEGIC_INFOCOMM_TECHNOLOGIES_CSIT = 'csit'`. |
| `packages/plugins/index.ts` | `+ import CentreForStrategicInfocommTechnologiesCSITModule` + `ALL_SOURCE_MODULES` entry. |
| `tsconfig.base.json` | `+` path alias. |
| `jest.config.js` | `+` moduleNameMapper entry. |
| `.specify/specs/1231-source-company-csit/` | This spec/plan/tasks. |

## Verification

- `tsc --noEmit` clean for the new package.
- Mocked unit suite green (no live network).
- Optional: live probe against `https://api.lever.co/v0/postings/csit?mode=json`.
