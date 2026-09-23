# Tasks: 5144 — docs-lint forbidden pipeline terms

- [x] 1. `scripts/docs-lint.ts` — `FORBIDDEN_TERM_RES` phrase regexes,
  `FORBIDDEN_TERMS_ALLOWLIST` ratchet (16 files / 22 occurrences),
  `forbiddenTerms` result field, check 8, `formatResult` + `ok` wiring.
  - AC: new occurrences fail lint; grandfathered files pass.
- [x] 2. Verify `npm run lint:docs` green on the current tree; inject a
  term to confirm failure output, revert.
  - AC: `file:line → term` shown for injected mention only.
- [x] 3. `npx tsc --project tsconfig.typecheck.json --noEmit` clean;
  docs/index.md row + docs/log.md entry; PR to `develop`.
  - AC: PR open, CI green.
