# Spec 5104 — Source Company Plugin: Deft Robotics (deftai.co)

| Field | Value |
|---|---|
| Spec | 5104 |
| Slug | source-company-deftai_co |
| Site | `deftai_co` |
| Company | Deft Robotics |
| Domain | `deftai.co` |

## Problem

`deftai.co/careers` is a Framer-published static page that lists open roles but does not use a recognized ATS. Each role links to a per-role Tally application form (`tally.so/r/{id}` or `tally.so/embed/{id}`). Because Tally is a form builder and not a job-board API, the generic ATS plugins cannot harvest these roles. A company-specific plugin is needed to parse the Framer cards and emit canonical `JobPostDto` records.

## Scope

- Add a `source-company-deftai_co` plugin that fetches `https://www.deftai.co/careers`.
- Extract the visible open-role cards from the Framer `#open-roles` section.
- For each card, parse title, location, and the Tally apply URL.
- Normalize `tally.so/embed/{id}` URLs to `tally.so/r/{id}` for `applyUrl`/`jobUrl`.
- Register the plugin in the four canonical source-plugin files.
- Add a fixture-based unit test using a captured copy of the careers page.

## Non-Goals

- Do not build a generic Tally scraper; this plugin is company-specific because the job listing lives in the Framer markup and Tally only hosts the forms.
- Do not extract full job descriptions; the careers page does not expose per-role descriptions.

## Acceptance Criteria

- `npx jest --testPathPatterns deftai_co` passes.
- `npx tsc --noEmit -p packages/plugins/source-company-deftai_co/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- The scraper returns exactly the 9 visible roles currently on the page.
- Each returned job has `site: Site.DEFTAI_CO`, `companyName: 'Deft Robotics'`, `companyUrl: 'https://www.deftai.co/'`, and a `tally.so/r/{id}` apply URL.

## Contracts

- Plugin token derived from the registrable domain per Spec 5069: `deftai.co` → `deftai_co`.
- `Site.DEFTAI_CO = 'deftai_co'`.
- `companyDomains: ['deftai.co', 'www.deftai.co']`.

## Design

### Scraping unit

The careers page renders multiple breakpoint variants of each card in the DOM. The correct scraping unit is a `div[data-framer-name="Variant 1"]` that also contains a `tally.so` apply link. Cards without a Tally link (e.g., the "CASE STUDIES" promo card) are ignored. Hidden breakpoint duplicates do not contain a distinct apply link, so the same link deduplicates them naturally; we further guard by taking only the first card per normalized title.

### Field mapping

| Source | Field | Notes |
|---|---|---|
| First leaf text node in card | `title` | Strip zero-width joiners (`\u2060`). |
| Second leaf text node | `location` | Parse "San Francisco, CA" or "SF" into `LocationDto`. |
| `a[href*="tally.so"]` | `applyUrl` / `jobUrl` / `jobUrlDirect` | Normalize `embed/{id}` to `https://tally.so/r/{id}`. |
| Static | `companyName` | `'Deft Robotics'` |
| Static | `companyUrl` | `'https://www.deftai.co/'` |
| Static | `jobType` | `[JobType.FULL_TIME]` |
| Static | `workFromHomeType` | `'On Site'` |

### Location parsing

- "San Francisco, CA" → `{ city: 'San Francisco', state: 'CA', country: Country.USA }`.
- "SF" is treated as shorthand for San Francisco, CA.

## Tests

- Load `__tests__/fixtures/deftai-careers.html` and assert 9 jobs are returned.
- Assert titles include all 9 current roles.
- Assert each `jobUrl` starts with `https://tally.so/r/` and the GTM Lead role is normalized from `tally.so/embed/ODajNA`.
- Assert the "CASE STUDIES" card and the referral form (`5B1Myd`) are not included.
- Assert filtering by `searchTerm`, `location`, and `resultsWanted` works as in other company plugins.
