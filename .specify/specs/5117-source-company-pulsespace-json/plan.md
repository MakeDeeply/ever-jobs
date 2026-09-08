# Plan — Spec 5117 — Refactor Pulse Space to extract jobs from the React JS bundle

| Field | Value |
|---|---|
| Spec | 5117 |
| Slug | `source-company-pulsespace-json` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-08 |
| Last updated | 2026-09-08 |

## Phase 1: Spec Kit

- Create `.specify/specs/5117-source-company-pulsespace-json/{spec,plan,tasks}.md`.
- Append Spec 5117 row to `docs/index.md` and prepend entry to `docs/log.md`.

## Phase 2: Service refactor

- Rewrite `pulsespace.service.ts`:
  - Replace listing/detail-page loop with bundle discovery + single bundle fetch.
  - Add `resolveBundleUrl`, `parseWveObject`, `parseJsObjectLiteral`, and `quoteUnquotedKeys` helpers.
  - Add `PulsespaceJobRecord` interface and `isJobRecord` guard.
  - Add `buildJob` and `buildDescription` to map the parsed object to `JobPostDto`.
  - Keep `applyInput`, filters, location parsing, job-type/employment-type helpers, and error handling.
- Update `pulsespace.constants.ts` to remove the now-unused `PULSESPACE_DETAIL_CONCURRENCY` constant.

## Phase 3: Fixtures and tests

- Replace `__tests__/fixtures/careers.html` with a React shell pointing at `/assets/index-COHmS8Cs.js`.
- Add `__tests__/fixtures/bundle.js` with a `const wve = { ... }` literal containing the five roles.
- Update `__tests__/pulsespace.service.spec.ts`:
  - Load the bundle fixture.
  - Mock the bundle URL request.
  - Update assertions to match real bundle data order (sorted by slug).
  - Replace the obsolete SSR/detail-page mock paths.

## Phase 4: Validation

- `npx tsc --noEmit -p packages/plugins/source-company-pulsespace/tsconfig.json`
- `npx tsc --noEmit -p apps/api/tsconfig.json`
- `npx jest --testPathPatterns pulsespace`
- `npx jest --testPathPatterns company-domains-inline`
- `npm run lint:docs`

## Phase 5: PR

- Commit, push `devin/fix-pulsespace-json-5117`.
- Open PR against `develop` describing the refactor and the fixture-based validation.
