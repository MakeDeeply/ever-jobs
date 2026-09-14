# Plan — Spec 5110 — Source Company Plugin: Kyber Labs

## Phase 1: Spec Kit

- Create `.specify/specs/5110-source-company-kyberlabs_ai/spec.md`, `plan.md`, `tasks.md`.
- Add entry to `docs/index.md` and `docs/log.md`.

## Phase 2: Package scaffold

- `packages/plugins/source-company-kyberlabs_ai/package.json`
- `packages/plugins/source-company-kyberlabs_ai/tsconfig.json`
- `src/index.ts`, `src/kyberlabs_ai.module.ts`, `src/kyberlabs_ai.constants.ts`, `src/kyberlabs_ai.types.ts`

## Phase 3: Plugin implementation

- `src/kyberlabs_ai.service.ts`
  - Static HTTP GET of `kyberlabs.ai/jobs`.
  - Cheerio selectors for `h2[data-aid="FLEX_HEADING"]`, `div[data-aid="FLEX_RICHTEXT"]`, `a[data-aid="FLEX_CTA_BTN"]`.
  - Deduplicate by normalized title.
  - Map to `JobPostDto` with `id` prefix `kyberlabs_ai-`.
  - `applyInput()` for standard filters.

## Phase 4: Registration

- `packages/models/src/enums/site.enum.ts` — add `KYBERLABS_AI = 'kyberlabs_ai'`.
- `packages/plugins/index.ts` — import/export `KyberlabsAiModule` in both `import` and `ALL_SOURCE_MODULES` blocks.
- `tsconfig.base.json` — add `@ever-jobs/source-company-kyberlabs_ai` path.
- `jest.config.js` — add moduleNameMapper entry.

## Phase 5: Tests

- `__tests__/fixtures/jobs.html` — minimal static GoDaddy flex-widget fixture.
- `__tests__/kyberlabs_ai.service.spec.ts` — mock `HttpClient`, assert title, apply URL, location, job type, and filters.

## Phase 6: Validation

- `npx tsc --noEmit -p packages/plugins/source-company-kyberlabs_ai/tsconfig.json`
- `npx tsc --noEmit -p apps/api/tsconfig.json`
- `npx jest --testPathPatterns kyberlabs_ai`
- `npm run lint:docs`

## Phase 7: PR

- Commit, push `devin/source-company-kyberlabs_ai-5110`.
- Open PR against `develop`, referencing Spec 5110.
