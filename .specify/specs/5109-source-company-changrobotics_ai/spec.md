# Spec 5109 — Source Company Plugin: Chang Robotics (`source-company-changrobotics_ai`)

| Field | Value |
|---|---|
| Spec | 5109 |
| Slug | `source-company-changrobotics_ai` |
| Site | `changrobotics_ai` |
| Canonical domain | `changrobotics.ai` |

## Problem

Chang Robotics (`changrobotics.ai`) hosts its careers page on Wix at `https://www.changrobotics.ai/careers`. The page uses a JavaScript-hydrated accordion that lists roles and external apply links. Because the roles are not served by a recognized ATS, the company is currently unharvested. A dedicated company plugin is needed to render the Wix page, extract each role's title, description, location, and `applyUrl`, and surface the jobs without following the external apply destinations.

## Scope

- Add `source-company-changrobotics_ai` that renders the Wix careers page with `BrowserPool` and parses the accordion with Cheerio.
- Extract the title from `.wixui-accordion__title`, the description from the panel's `data-testid="richTextElement"`, the `applyUrl` from `a[aria-label="Apply Now"]`, and the location from phrases such as `Must live in {city}, {state}` inside the description.
- Map results to `JobPostDto` with `site: Site.CHANGROBOTICS_AI`, `companyName: 'Chang Robotics'`, `companyUrl`/`jobUrl` pointing to the careers page, and `applyUrl` set to the external Microsoft Form / Indeed link.
- Register the plugin in the four canonical source-plugin files.
- Add unit tests with a mocked `BrowserPool` fixture that captures both known roles.

## Non-Goals

- Do not scrape the Microsoft Form or Indeed detail pages; the plugin stops at the external `applyUrl`.
- Do not attempt to derive a stable numeric job ID from Wix internals; job IDs are stable slugs derived from the title.
- Do not support non-accordion Wix career pages beyond `https://www.changrobotics.ai/careers`.

## Acceptance Criteria

- `npx jest --testPathPatterns changrobotics_ai` passes.
- `npx tsc --noEmit -p packages/plugins/source-company-changrobotics_ai/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- The fixture returns the two known roles (`Factory Automation Expert`, `Growth Marketing Specialist`) with the correct Microsoft Form and Indeed apply URLs.
- `applyInput` filters (`searchTerm`, `location`, `isRemote`, `jobType`, `offset`, `resultsWanted`) work correctly.

## Design

### Naming

Per Spec 5069, the plugin token is derived from the canonical domain `changrobotics.ai`:

1. Lowercase and strip scheme/path.
2. Strip leading `www.`.
3. Strip trailing `.com` (does not apply).
4. Replace remaining `.` with `_`.

`changrobotics.ai` → `changrobotics_ai`.

`companyDomains: ['changrobotics.ai']`.

### Wrapper contract

```ts
@SourcePlugin({
  site: Site.CHANGROBOTICS_AI,
  name: 'Chang Robotics',
  category: 'company',
  companyDomains: ['changrobotics.ai'],
})
```

### `scrape(input)`

1. Use `BrowserPool.getPage({ proxy, stealth: true, headful: true })` to render `input.companyUrl || CHANGROBOTICS_AI_CAREERS_URL`.
2. Wait for `.wixui-accordion__item` and capture `page.content()`.
3. `parseJobs(html, companyUrl)`:
   - For each accordion item, read the title from `.wixui-accordion__title`.
   - Read the panel's `div[data-testid="richTextElement"]` HTML, convert to markdown via `markdownConverter`.
   - Extract the `applyUrl` from the first `a[aria-label="Apply Now"]` inside the panel.
   - Parse `Must live in {city}, {state}` from the description text; build a `LocationDto` with `Country.USA`.
   - Resolve `jobType` and `employmentType` from description tokens (defaulting to `FULL_TIME` / `'Full time'`).
   - Build `id` as `changrobotics_ai-{slugify(title)}`.
4. Apply `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted` filters.

### Tests

- `__tests__/changrobotics_ai.service.spec.ts`:
  - Mock `BrowserPool.getPage` with `{ goto, content, close }`.
  - Override `fetchHtml` to return a fixture containing the two rendered accordion items.
  - Assert both roles are returned with correct `title`, `applyUrl`, `site`, `companyName`, `location`, and `description`.
  - Assert `searchTerm` narrows results, `location` matches `Jacksonville`, and `offset`/`resultsWanted` slice the list.

## Files

`packages/plugins/source-company-changrobotics_ai/*`, `packages/models/src/enums/site.enum.ts`, `packages/plugins/index.ts`, `tsconfig.base.json`, `jest.config.js`, `docs/index.md`, `docs/log.md`.
