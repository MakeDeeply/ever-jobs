# Spec 5117 — Refactor Pulse Space to extract jobs from the React JS bundle

| Field | Value |
|---|---|
| Spec | 5117 |
| Slug | `source-company-pulsespace-json` |
| Status | in progress |
| Owner | devin |
| Created | 2026-09-08 |
| Last updated | 2026-09-08 |
| Related specs | 5114 (`source-company-pulsespace`) |

## Problem

`source-company-pulsespace` (Spec 5114) fetches `https://pulsespace.com/careers` and parses the server-rendered HTML for `<a href="/careers/<slug>">` links. The live page is a React shell with an empty `<div id="root"></div>` and no SSR links, so the plugin returns zero jobs even though the browser renders five open roles after loading the main JS bundle. The role data is hardcoded in `https://pulsespace.com/assets/index-<hash>.js` as `const wve = { ... }`, keyed by slug, and the detail pages (`/careers/<slug>`) reuse the same object.

## Scope

- Update `packages/plugins/source-company-pulsespace/src/pulsespace.service.ts` to:
  - Load `https://pulsespace.com/careers` (or `input.companyUrl`).
  - Find the `<script src="/assets/index-*.js">` main bundle.
  - Fetch the bundle, locate `const wve = { ... }`, extract the object literal, and parse it to JSON.
  - Build `JobPostDto` records directly from the parsed object, eliminating per-detail HTTP calls.
- Preserve all existing filters: `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, `resultsWanted`.
- Preserve metadata mapping: `location`, `employmentType`, `department`, `description`, and intentionally blank `applyUrl`.
- Map object fields to description sections:
  - `summary` → `Position Summary`
  - `responsibilities` → `Key Responsibilities`
  - `basicQualifications` → `Basic Qualifications`
  - `preferredQualifications` → `Preferred Qualifications`
  - `competencies` → `Competencies`
  - `closing` → `Closing` (optional)
- Update the existing fixture `careers.html` to a React shell that points at a bundle fixture.
- Add `__tests__/fixtures/bundle.js` containing a `const wve = { ... }` literal with the five roles.
- Update `__tests__/pulsespace.service.spec.ts` to mock the bundle fetch and assert against the parsed data.
- Remove the unused `PULSESPACE_DETAIL_CONCURRENCY` constant and detail-fixture dependency from `pulsespace.constants.ts` / `pulsespace.service.ts`.
- Update `docs/index.md` and `docs/log.md`.

## Non-Goals

- No `BrowserPool`/headless rendering.
- No external JSON/API endpoint discovery beyond the main JS bundle.
- No new plugin package; this is a refactor of the existing `source-company-pulsespace` plugin.
- No change to `companyDomains` or plugin registration.

## Acceptance Criteria

- `npx tsc --noEmit -p packages/plugins/source-company-pulsespace/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- `npx jest --testPathPatterns pulsespace` passes.
- `npx jest --testPathPatterns company-domains-inline` passes.
- `npm run lint:docs` is clean.

## Design

### HTTP fetch

`PulsespaceService.fetchJobs()` now makes at most two requests:
1. GET the listing page to discover the bundle `src`.
2. GET the main JS bundle.

### Bundle parsing

- `resolveBundleUrl($, origin)` selects `script[src*="/assets/index-"][src$=".js"]` and resolves the `src` against the page origin.
- `parseWveObject(source)` tries `const wve=`, `var wve=`, `let wve=`, and `wve=` markers.
- `parseJsObjectLiteral(source, marker)` locates the matching `{ ... }` block using brace balance while respecting `"`-delimited strings and `\` escapes.
- `quoteUnquotedKeys(jsObject)` wraps bare identifier keys in double quotes so the text becomes valid JSON, then `JSON.parse()` turns it into a plain object.

### Data model

Each entry in `wve` is typed as:

```ts
interface PulsespaceJobRecord {
  title: string;
  location: string;
  jobType: string;
  department: string;
  summary?: string | string[];
  responsibilities?: string | string[];
  basicQualifications?: string | string[];
  preferredQualifications?: string | string[];
  competencies?: string | string[];
  closing?: string;
}
```

Only entries with a non-empty `title` and `location` are emitted. Slugs are sorted lexicographically for stable ordering across `offset`/`resultsWanted` tests.

### Job URL

`jobUrl` and `jobUrlDirect` are `https://pulsespace.com/careers/<slug>` (or the equivalent under `input.companyUrl`).

### Field mapping

- `id`: `pulsespace-${slug}`.
- `site`: `Site.PULSESPACE`.
- `title`: `record.title`.
- `companyName`: `'Pulse Space'`.
- `companyUrl`: `input.companyUrl` or `https://pulsespace.com`.
- `location`: parsed from `record.location` (`Seattle, WA` → city/state/USA).
- `jobType`: derived from `record.jobType` (`Full-Time` → `[JobType.FULL_TIME]`).
- `employmentType`: human-readable label.
- `department`: `record.department`.
- `description`: `## Position Summary\n\n- ...` etc., concatenated sections.
- `applyUrl`: intentionally omitted/blank.

## Files

- `packages/plugins/source-company-pulsespace/src/pulsespace.service.ts`
- `packages/plugins/source-company-pulsespace/src/pulsespace.constants.ts`
- `packages/plugins/source-company-pulsespace/__tests__/pulsespace.service.spec.ts`
- `packages/plugins/source-company-pulsespace/__tests__/fixtures/careers.html`
- `packages/plugins/source-company-pulsespace/__tests__/fixtures/bundle.js`
- `docs/index.md`
- `docs/log.md`
