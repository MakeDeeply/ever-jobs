# Plan: 5116 — Fix General Galactic Careers URL

| Field | Value |
|---|---|
| Spec | [spec.md](./spec.md) |
| Created | 2026-09-07 |
| Last updated | 2026-09-07 |

## 1. Approach

The plugin default `companyUrl` is the only source of the `.html` suffix. Update the constant, then adjust the unit-test mock so the listing fixture is served for the new canonical URL and update the `companyUrl` assertion.

## 2. Phases

### Phase 1 — Fix constant and tests

- Update `GENGALACTIC_CAREERS_URL` in `gengalactic.constants.ts`.
- Update `mockBothFixtures` in `gengalactic.service.spec.ts` to match `https://gengalactic.com/careers`.
- Update the `companyUrl` assertion in the metadata test.

### Phase 2 — Docs and validation

- Add Spec 5116 entries to `docs/index.md` and `docs/log.md`.
- Run focused `tsc`, `jest`, and `lint:docs` validation.
- Commit and open a PR against `origin/develop`.

## 3. Packages Touched

| Package | Change |
|---|---|
| `packages/plugins/source-company-gengalactic` | constant + tests |
| `docs/index.md` | new spec row |
| `docs/log.md` | new spec entry |

## 4. Dependencies

None.

## 5. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Test mock still matches `.html` | low | medium | Update mock in same commit. |
| `docs/log.md` lint drift | low | low | Run `npm run lint:docs` before push. |

## 6. Rollback Plan

Revert the constant change. No data or config migration.

## 7. Migration Plan

Not applicable.

## 8. Open Questions for Plan

None.
