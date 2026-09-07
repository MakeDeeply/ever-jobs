# Plan — Spec 5108: `companyDomains` Inline-Array Lint & Checklist

| Field | Value |
|---|---|
| Spec | spec.md |
| Created | 2026-09-07 |
| Last updated | 2026-09-07 |

## Approach

A small, repo-local lint test is the cheapest guard: it reads each company plugin service file as plain text and asserts the `companyDomains` decorator field is an inline array of quoted strings. Because it runs in CI under `npm run test:scripts`, it blocks any future PR that introduces a constant or variable reference. The existing `source-company-shinkei_systems` violation is fixed in the same changeset so the lint passes immediately. A one-line checklist reminder in the Spec Kit tasks template makes the convention visible during spec writing.

## Phases

### Phase 1 — Lint test

- Add `scripts/__tests__/company-domains-inline.spec.ts`.
- Cover real `packages/plugins` scan plus synthetic temp-repo unit cases.

### Phase 2 — Fix Shinkei

- Inline `companyDomains` in `shinkei_systems.service.ts`.
- Remove `SHINKEI_SYSTEMS_DOMAINS` from `shinkei_systems.constants.ts` and the service import.

### Phase 3 — Spec Kit checklist

- Update `.specify/templates/tasks.template.md` with the `companyDomains` inline-array reminder.

### Phase 4 — Docs & validation

- Add Spec 5108 to `docs/index.md`.
- Append entry to `docs/log.md`.
- Run `npx jest --testPathPatterns company-domains-inline`, `npx jest --testPathPatterns shinkei_systems`, `npx tsc --noEmit -p apps/api/tsconfig.json`, and `npm run lint:docs`.

## Packages Touched

| Package | Change |
|---|---|
| `scripts/__tests__` | New lint test |
| `packages/plugins/source-company-shinkei_systems` | Inline `companyDomains`, remove unused constant |
| `.specify/templates` | Checklist reminder |
| `docs/` | Index + log entries |

## Dependencies

None.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Regex misses a future non-standard declaration | Low | Medium | Keep the lint simple; if a new pattern appears, the test can be tightened. |
| Test reads large plugin tree slowly | Low | Low | Only scans `source-company-*` service files; expected <100 ms. |

## Rollback Plan

Revert the branch. The lint is additive and only blocks new violations; reverting restores previous behavior.
