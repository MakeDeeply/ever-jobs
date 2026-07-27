# Plan: 5071 — Patch high-severity `js-yaml` and `fast-uri`

## Phase 1 — Add overrides

- In root `package.json` `overrides`:
  - Set `fast-uri` to `^3.1.4`.
  - Set `js-yaml` to `^4.3.0` for `@eslint/eslintrc`, `@nestjs/swagger`, `cosmiconfig`, `eslint`.
  - Set `js-yaml` to `^3.15.0` for `@istanbuljs/load-nyc-config`, `front-matter`, and `@yarnpkg/parsers@3.0.0-rc.46`.

## Phase 2 — Regenerate lockfile

- Run `npm install` to update `package-lock.json`.
- Verify `npm ls js-yaml fast-uri` shows patched versions.

## Phase 3 — Validate

- Run targeted `jest` suites.
- Run `tsc --noEmit` on `packages/common`, `packages/models`, `apps/api`.
- Run `npm audit --audit-level=high` to confirm only `brace-expansion` remains.

## Phase 4 — Commit and PR

- Update `docs/index.md` and `docs/log.md`.
- Commit with `chore(deps): patch js-yaml and fast-uri vulnerabilities (Spec 5071)`.
- Push branch and open PR against `develop`.
