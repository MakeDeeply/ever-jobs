# Plan — Spec 5109: `source-company-changrobotics_ai`

## Phase 1 — Scaffold

Create `packages/plugins/source-company-changrobotics_ai` with `package.json`, `tsconfig.json`, `src/index.ts`, `src/changrobotics_ai.constants.ts`, `src/changrobotics_ai.types.ts`, and `src/changrobotics_ai.module.ts`.

## Phase 2 — Implement scraper

Write `src/changrobotics_ai.service.ts`:

- `scrape()` orchestrates fetch, parse, filter, and diagnostics.
- `fetchHtml()` uses `BrowserPool.getPage()` and waits for the accordion selector.
- `parseJobs()` extracts title, description, apply URL, location, and job type from each Wix accordion item.
- `applyInput()` filters by `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted`.

## Phase 3 — Register

- Add `Site.CHANGROBOTICS_AI` to `packages/models/src/enums/site.enum.ts`.
- Add `ChangroboticsAiModule` import and export to `packages/plugins/index.ts`.
- Add `@ever-jobs/source-company-changrobotics_ai` path alias to `tsconfig.base.json` and `jest.config.js`.

## Phase 4 — Test

Add `__tests__/changrobotics_ai.service.spec.ts` plus `__tests__/fixtures/careers.html`:

- Happy path: both roles extracted.
- Apply URL extraction: Microsoft Form and Indeed.
- Location parsing from `Must live in Jacksonville, FL`.
- `searchTerm`, `location`, `offset`, and `resultsWanted` filters.

## Phase 5 — Docs

Update `docs/index.md` (Spec table) and `docs/log.md` (newest entry) with Spec 5109.
