# Plan: 1618 — Source Company Plugin: Fietsenwinkel.nl (Recruitee company-direct)

| Field | Value |
| --- | --- |
| Spec | spec.md |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |

## Approach

Clone the proven registry-delegation pattern via
`scripts/scaffold-recruitee-company-source.ts`. The service is a thin
registry-delegating adaptor — no bespoke HTTP or parsing — so it inherits every
Recruitee field fix. Registration is applied by the backend-agnostic
`scripts/wire-company-source.ts`.

## Files

| File | Change |
|------|--------|
| `packages/plugins/source-company-fietsenwinkelnl/*` | New package (module, service, index, tests, fixture). |
| `packages/models/src/enums/site.enum.ts` | `+ FIETSENWINKEL_NL = 'fietsenwinkelnl'`. |
| `packages/plugins/index.ts` | `+ import FietsenwinkelNlModule` + `ALL_SOURCE_MODULES` entry. |
| `tsconfig.base.json` | `+` path alias. |
| `jest.config.js` | `+` moduleNameMapper entry. |
| `.specify/specs/1618-source-company-fietsenwinkelnl/` | This spec/plan/tasks. |

## Verification

- `tsc --noEmit` clean for the new package.
- Mocked unit suite green (no live network).
- Optional: live probe against `https://fietsenwinkelnl.recruitee.com/api/offers`.
