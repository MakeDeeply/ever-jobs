# Plan — Spec 5115 — Source Company Plugin: ReNEW Manufacturing Solutions

| Field | Value |
|---|---|
| Spec | 5115 |
| Slug | `source-company-renewmfgsol` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-07 |
| Last updated | 2026-09-07 |

## Phase 1: Spec Kit

- Create `.specify/specs/5115-source-company-renewmfgsol/{spec,plan,tasks}.md`.
- Append Spec 5115 row to `docs/index.md` and prepend entry to `docs/log.md`.

## Phase 2: Package scaffold

- `packages/plugins/source-company-renewmfgsol/package.json`
- `packages/plugins/source-company-renewmfgsol/tsconfig.json`
- `src/index.ts`, `src/renewmfgsol.module.ts`, `src/renewmfgsol.constants.ts`

## Phase 3: Plugin implementation

- `src/renewmfgsol.service.ts`
  - GET `https://www.renewmfgsol.com/about/work-with-us` (or `input.companyUrl`).
  - Parse `div.atmc-career-01_box` cards for title, location, and apply href.
  - Resolve apply hrefs to absolute URLs.
  - Fetch internal detail pages with bounded `Promise.allSettled` concurrency.
  - Extract description from meta tags or `#main-content` rich text.
  - Map to `JobPostDto` with `id = renewmfgsol-${slugify(title)}`.

## Phase 4: Registration

- `packages/models/src/enums/site.enum.ts` — add `RENEWMFGSOL = 'renewmfgsol'`.
- `packages/plugins/index.ts` — import/export `RenewmfgsolModule`.
- `tsconfig.base.json` — add `@ever-jobs/source-company-renewmfgsol` path.
- `jest.config.js` — add matching `moduleNameMapper` entry.

## Phase 5: Tests

- `__tests__/fixtures/work-with-us.html` — sanitized listing with 2 cards.
- `__tests__/fixtures/hiring-welders-ga.html` — sanitized internal detail page.
- `__tests__/renewmfgsol.service.spec.ts` — mock `HttpClient`, assert title, site, companyName, `companyDomains`, location, `applyUrl`, `jobUrl`, `jobType`, `employmentType`, `isRemote`, `workFromHomeType`, `description`, filters, and empty list.

## Phase 6: Validation

- `npx tsc --noEmit -p packages/plugins/source-company-renewmfgsol/tsconfig.json`
- `npx tsc --noEmit -p apps/api/tsconfig.json`
- `npx jest --testPathPatterns renewmfgsol`
- `npm run lint:docs`

## Phase 7: PR

- Commit, push `devin/source-company-renewmfgsol-5115`.
- Open PR against `develop`, explicitly mentioning `companyDomains: ['renewmfgsol.com']`.
