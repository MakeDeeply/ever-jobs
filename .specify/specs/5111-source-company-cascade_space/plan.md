# Plan — Spec 5111 — Source Company Plugin: Cascade Space

## Phase 1: Spec Kit

- Create `.specify/specs/5111-source-company-cascade_space/spec.md`, `plan.md`, `tasks.md`.
- Add entry to `docs/index.md` and `docs/log.md`.

## Phase 2: Package scaffold

- `packages/plugins/source-company-cascade_space/package.json`
- `packages/plugins/source-company-cascade_space/tsconfig.json`
- `src/index.ts`, `src/cascade_space.module.ts`, `src/cascade_space.constants.ts`

## Phase 3: Plugin implementation

- `src/cascade_space.service.ts`
  - Static HTTP GET of `cascade.space/careers/`.
  - Cheerio selectors for `h3` titles, sibling tagline divs, and `/careers/` detail links.
  - Bounded `Promise.allSettled` fetch of detail pages for descriptions.
  - Extract `mailto:` apply email from detail pages.
  - Deduplicate by normalized title.
  - Map to `JobPostDto` with `id` prefix `cascade_space-`.
  - `applyInput()` for standard filters.

## Phase 4: Registration

- `packages/models/src/enums/site.enum.ts` — add `CASCADE_SPACE = 'cascade_space'`.
- `packages/plugins/index.ts` — import/export `CascadeSpaceModule` in both `import` and `ALL_SOURCE_MODULES` blocks.
- `tsconfig.base.json` — add `@ever-jobs/source-company-cascade_space` path.
- `jest.config.js` — add `moduleNameMapper` entry.

## Phase 5: Tests

- `__tests__/fixtures/careers.html` — minimal static Next.js listing fixture with one job card.
- `__tests__/fixtures/mech-e.html` — minimal static Next.js detail fixture with description and `mailto:` link.
- `__tests__/cascade_space.service.spec.ts` — mock `HttpClient`, assert title, apply email, description, location, job type, and filters.

## Phase 6: Validation

- `npx tsc --noEmit -p packages/plugins/source-company-cascade_space/tsconfig.json`
- `npx tsc --noEmit -p apps/api/tsconfig.json`
- `npx jest --testPathPatterns cascade_space`
- `npm run lint:docs`

## Phase 7: PR

- Commit, push `devin/source-company-cascade_space-5111`.
- Open PR against `develop`, referencing Spec 5111.
