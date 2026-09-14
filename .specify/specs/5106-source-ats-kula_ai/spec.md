# Spec 5106 — Source ATS Plugin: Kula AI (`source-ats-kula_ai`)

| Field | Value |
|---|---|
| Spec | 5106 |
| Slug | `source-ats-kula_ai` |
| Site | `kula_ai` |
| ATS host | `careers.kula.ai` |
| Test account | `shinkei` |

## Problem

Kula-hosted career portals (`careers.kula.ai/<account>`) expose a public XML feed at `/feed` that lists up to 25 open roles with rich `job:` namespace fields. The rendered careers page can contain additional roles that the feed omits (for the `shinkei` account, 26 jobs are visible vs. 25 in the feed). Each role has a detail page that embeds a schema.org `JobPosting` JSON-LD document. No generic ATS plugin currently handles Kula boards, so they are classified as company-hosted and skipped.

## Scope

- Add a `source-ats-kula_ai` plugin that targets any `careers.kula.ai/<account>` board.
- Fetch the public XML feed (`/feed`) as the canonical first 25 jobs.
- Render the careers list page with Playwright to discover every job ID/apply link.
- For each discovered job ID, fetch the static detail page (`/<account>/{id}/`) and parse its JSON-LD `JobPosting`.
- Match XML feed jobs against JSON-LD detail jobs; use the XML as ground truth for Kula-specific fields and the JSON-LD for the full description and `baseSalary` min/max.
- Return jobs beyond the feed by applying the same JSON-LD parser to HTML-only jobs.
- Register the plugin in the four canonical source-plugin files.
- Add fixture-based unit tests.

## Non-Goals

- Do not call the authenticated Kula REST API (`api.kula.ai/v1/job-boards/job-posts`), which requires a tenant Bearer token.
- Do not guess detail URLs from feed links; always derive them from the rendered list or feed `guid`/`link`.
- Do not synthesize company names; use `hiringOrganization.name` from JSON-LD or the supplied `companyName`.

## Acceptance Criteria

- `npx jest --testPathPatterns kula_ai` passes.
- `npx tsc --noEmit -p packages/plugins/source-ats-kula_ai/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- The scraper returns the 25 XML feed jobs plus the `Marketing Intern` detail-page-only role for the `shinkei` fixture.
- Each returned job has `site: Site.KULA_AI`, `atsType: 'kula_ai'`, and a Kula apply URL.
- Mismatches between XML and JSON-LD fields emit diagnostics; the merge rule prefers the XML for employment type, workplace, location office flags, and salary interval, and JSON-LD for description and salary min/max.

## Contracts

- Plugin token derived from registrable domain per naming rule: `kula.ai` → `source-ats-kula_ai`.
- `Site.KULA_AI = 'kula_ai'`.
- `resolveCompanyUrl` maps `careers.kula.ai` to `Site.KULA_AI` with `companySlug` = the first path segment.

## Design

### Scraping unit

1. **Account resolution**
   - `companySlug` from input, or parsed from `companyUrl` matching `careers.kula.ai/<account>`.
   - Base URL: `https://careers.kula.ai/<account>`.

2. **XML feed**
   - `GET <baseUrl>/feed`.
   - Parse `<item>` blocks with regex (no XML parser dependency).
   - Extract `title`, `link`, `pubDate`, `category`, `description` (CDATA HTML), and `job:` namespaced fields.
   - Map each item to a `KulaFeedJob` keyed by the numeric ID extracted from `<link>` or `<guid>`.

3. **Rendered list page**
   - `GET <baseUrl>` with Playwright (`chromium.launch`, `networkidle`, settle).
   - Wait for apply links matching `/<account>/{id}/` and collect unique IDs.
   - If Playwright is unavailable or the list fails to load, fall back to the feed-only set.

4. **Detail page**
   - For each discovered ID, `GET <baseUrl>/{id}/` and parse `application/ld+json` `JobPosting` via `parseJobPostingLd`.
   - Map JSON-LD to `JobPostDto` fields.

5. **Merge**
   - For IDs present in both feed and JSON-LD:
     - `title`: prefer feed, warn if different.
     - `description`: prefer JSON-LD; if JSON-LD missing, fall back to feed `description`.
     - `compensation.minAmount/maxAmount`: prefer JSON-LD `baseSalary.value.min/max`.
     - `compensation.interval`: prefer XML `job:salary/interval` (e.g. `YEARLY`, `HOURLY`).
     - `employmentType`: prefer XML `job:employmentType`.
     - `workplace` / `isRemote`: prefer XML `job:workplace` and `job:location/remote`.
     - `location`: merge JSON-LD `jobLocation.address` with XML office flags.
     - `datePosted`: prefer JSON-LD `datePosted`, fallback to feed `pubDate`.
   - For IDs only in feed: use feed data.
   - For IDs only in JSON-LD: use JSON-LD data.

### Field mapping

| Source | Field | Notes |
|---|---|---|
| XML `title` / JSON-LD `title` | `title` | Prefer XML; trim whitespace. |
| XML `link` / detail page URL | `jobUrl` | `https://careers.kula.ai/<account>/{id}/` |
| XML `job:employmentType` / JSON-LD `employmentType` | `jobType` | `FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `CONTRACT` → `JobType`. |
| XML `job:location` | `location` | `city`, `state`, `country`; `isHQ` and `remote` flags. |
| JSON-LD `jobLocation.address` | `location` | Fills missing city/state/country. |
| XML `job:salary` + JSON-LD `baseSalary` | `compensation` | `minAmount`, `maxAmount`, `currency`, `interval`. |
| JSON-LD `description` / XML `description` | `description` | Convert to requested format (markdown default). |
| JSON-LD `hiringOrganization.name` / input `companyName` | `companyName` | Use JSON-LD when present. |
| XML `pubDate` / JSON-LD `datePosted` | `datePosted` | `toDateOnly`. |
| XML `category` / department text from list | `department` | Used when available. |
| Detail page `script[type="application/ld+json"]` | `JobPosting` fields | `directApply` indicates direct application. |

### Location parsing

- XML `job:location/officeName`, `city`, `state`, `country`, `remote`, `isHQ` are used directly.
- JSON-LD `addressLocality`, `addressRegion`, `addressCountry` fill gaps.
- Remote flag: `XML workplace === 'REMOTE'` or `JSON-LD employmentType`/`jobLocation` has remote semantics; otherwise `isRemote` from XML `remote` boolean.

## Tests

- `__tests__/fixtures/shinkei-feed.xml` — the public XML feed for `shinkei` (25 items).
- `__tests__/fixtures/shinkei-list.html` — the rendered careers list DOM for `shinkei` (26 apply links, including the HTML-only `Marketing Intern`).
- `__tests__/fixtures/shinkei-detail-32624.html` and `shinkei-detail-54329.html` — detail pages for the first feed job and the HTML-only extra job.
- `__tests__/kula_ai.service.spec.ts`:
  - Returns 26 jobs for `shinkei` (mock list IDs + fixtures).
  - Merges XML and JSON-LD fields for `Mechanical Engineer` (id `32624`).
  - Parses the JSON-LD-only `Marketing Intern` (id `54329`) correctly.
  - Filters by `searchTerm`, `jobType`, `isRemote`, `location`, `resultsWanted`, and `offset`.
  - Returns 25 feed-only jobs when the list-page step is skipped.
