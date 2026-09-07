# Plan — Spec 5112 — Source Company Plugin: General Galactic

| Field | Value |
| --- | --- |
| Spec | 5112 |
| Slug | `source-company-gengalactic` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-03 |
| Last updated | 2026-09-03 |
| Related specs | 5069 (domain-to-token rule), 5111 (recent company plugin) |

## Phase 1: Spec Kit

- Create `.specify/specs/5112-source-company-gengalactic/{spec,plan,tasks}.md`.
- Add entry to `docs/index.md` and `docs/log.md`.

## Phase 2: Package scaffold

- `packages/plugins/source-company-gengalactic/package.json`
- `packages/plugins/source-company-gengalactic/tsconfig.json`
- `src/index.ts`, `src/gengalactic.module.ts`, `src/gengalactic.constants.ts`

## Phase 3: Plugin implementation

- `src/gengalactic.service.ts`
  - Static HTTP GET of `gengalactic.com/careers.html`.
  - Cheerio selectors for `a[href^="/careers/"]` cards with `.career-link-title`, `.career-location`, and employment `.badge-text`.
  - Bounded `Promise.allSettled` fetch of detail pages for descriptions.
  - Extract `h1`, `h2`, and `div.article.w-richtext` from detail pages.
  - Deduplicate by normalized title.
  - Map to `JobPostDto` with `id` prefix `gengalactic-`.
  - `applyInput()` for standard filters.

## Phase 4: Registration

- `packages/models/src/enums/site.enum.ts` — add `GENGALACTIC = 'gengalactic'`.
- `packages/plugins/index.ts` — import/export `GengalacticModule` in both import and `ALL_SOURCE_MODULES` blocks.
- `tsconfig.base.json` — add `@ever-jobs/source-company-gengalactic` path.
- `jest.config.js` — add `moduleNameMapper` entry.

## Phase 5: Tests

- `__tests__/fixtures/careers.html` — minimal Webflow listing fixture with two job cards.
- `__tests__/fixtures/electric-propulsion-test-engineer.html` — minimal Webflow detail fixture with description and `mailto:` link.
- `__tests__/gengalactic.service.spec.ts` — mock `HttpClient`, assert title, apply email, description, location, job type, and filters.

## Phase 6: Validation

- `npx tsc --noEmit -p packages/plugins/source-company-gengalactic/tsconfig.json`
- `npx tsc --noEmit -p apps/api/tsconfig.json`
- `npx jest --testPathPatterns gengalactic`
- `npm run lint:docs`

## Phase 7: PR

- Commit, push `devin/source-company-gengalactic-5112`.
- Open PR against `develop`, referencing Spec 5112.
