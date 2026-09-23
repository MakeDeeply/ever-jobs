# Plan: 5144 — docs-lint forbidden pipeline terms

| Field | Value |
| ----- | ----- |
| Spec ID | 5144 |
| Slug | docs-lint-forbidden-pipeline-terms |
| Status | Done |
| Owner | Devin (for MakeDeeply) |

## Phases

1. `scripts/docs-lint.ts`: add `FORBIDDEN_TERM_RES` phrase regexes +
   `FORBIDDEN_TERMS_ALLOWLIST` (file → grandfathered count); add check 8
   scanning every scanned markdown doc line-by-line; report
   `{from, term}` for occurrences beyond the ratchet; wire into
   `DocLintResult`, `formatResult`, and `ok`.
2. Verify: `npm run lint:docs` green on current tree; inject a term into
   a temp file to confirm the failure output (then revert).
3. `npx tsc`, docs index/log updates, PR to `develop`.

## Packages touched

- `scripts/docs-lint.ts`
- `.specify/specs/5144-docs-lint-forbidden-pipeline-terms/`
- `docs/index.md`, `docs/log.md`

## Risks

- Ratchet drift: a deleted mention lowers usage without failing — the
  allowlist should be tightened by hand in a later cleanup; documented
  in the spec.
- Phrase set too narrow to catch future vocabulary — acceptable;
  phrases can be appended to `FORBIDDEN_TERM_RES` as they appear.
