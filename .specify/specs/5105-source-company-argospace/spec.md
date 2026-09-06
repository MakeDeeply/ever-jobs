# Spec 5105 — Source Company Plugin: Argo Space (argospace.com)

| Field | Value |
|---|---|
| Spec | 5105 |
| Slug | source-company-argospace |
| Site | `argospace` |
| Company | Argo Space |
| Domain | `argospace.com` |

## Problem

`argospace.com/careers` is a Webflow-published page that lists 14 open roles but does not use a recognized ATS. The visible, grouped list links to per-role detail pages (`/careers/{slug}`) that contain job descriptions and an `APPLY NOW` button. Because the application destination differs by role (LinkedIn company jobs page for most, an on-page Webflow form for the intern), generic ATS plugins cannot harvest the board. A company-specific plugin is needed.

## Scope

- Add a `source-company-argospace` plugin that fetches `https://argospace.com/careers`.
- Parse the visible, department-grouped `careers-list-2` cards that link to `/careers/{slug}`.
- For each role, follow the detail page and extract:
  - title from `h1.heading-6`
  - type, location, and salary from `div.spec_div`
  - description markdown from `div.w-richtext`
  - `applyUrl` from the first apply button `href` (resolved to absolute; blank if none)
- Emit canonical `JobPostDto` records with `site: Site.ARGOSPACE`.
- Register the plugin in the four canonical source-plugin files.
- Add fixture-based unit tests.

## Non-Goals

- Do not scrape the hidden/flat LinkedIn-only list (`careers-list`) that duplicates the same roles.
- Do not synthesize per-job LinkedIn deep links where the detail page only exposes the generic company jobs page.
- Do not attempt to post the Webflow form; the plugin only reads the apply destination.

## Acceptance Criteria

- `npx jest --testPathPatterns argospace` passes.
- `npx tsc --noEmit -p packages/plugins/source-company-argospace/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- The scraper returns exactly the 14 visible roles currently on the page.
- Each returned job has `site: Site.ARGOSPACE`, `companyName: 'Argo Space'`, `companyUrl: 'https://argospace.com'`, and a detail-page `jobUrl`.
- `applyUrl` is the LinkedIn company jobs page for full-time roles and the detail-page URL (`#Apply-Now`) for the intern, or blank when no apply button exists.

## Contracts

- Plugin token derived from the registrable domain per Spec 5069: `argospace.com` → `argospace`.
- `Site.ARGOSPACE = 'argospace'`.
- `companyDomains: ['argospace.com', 'www.argospace.com']`.

## Design

### Scraping unit

The careers page renders two parallel lists. The visible list is the department-grouped set of `div.careers-list-wrapper` containers whose `a.career-box` links point to `/careers/{slug}`. The hidden flat list contains external LinkedIn URLs and is ignored.

For each visible card:
- `title` = `h2.jobtitletxt`
- `location` = `div.location-txt`
- `employmentType` label = `div.full-time-label` if visible (not `w-condition-invisible`)
- `salary` = `div.salary-txt` text if non-empty

The scraper then follows each `/careers/{slug}` page. The detail page structure is consistent:
- `h1.heading-6` title
- `div.spec_div` with `SPECIFICATIONS` label followed by type, location, salary, and an apply button
- `div.w-richtext` with the full description

The apply button is the first `a.button` in `section.careers-interior_hero` that links to anything other than `#` (blank). For full-time roles it points to `https://www.linkedin.com/company/argo-space/jobs/`. For the internship it links to `#Apply-Now`; this is resolved to `{detailUrl}#Apply-Now` because the form is on the same page.

### Field mapping

| Source | Field | Notes |
|---|---|---|
| `h2.jobtitletxt` / `h1.heading-6` | `title` | Prefer detail page title when available. |
| `div.location-txt` / spec `El Segundo, CA (On-site)` | `location` | Parse city, state, country = `Country.USA`. |
| `div.full-time-label` / first spec text | `employmentType` | `FULL_TIME` or `INTERNSHIP`. |
| `div.spec_txt` salary line | `compensation` | Optional; e.g. `$100K - $200K +Stock Options`. |
| `div.w-richtext` | `description` | Converted to markdown. |
| detail page URL | `jobUrl` | `https://argospace.com/careers/{slug}` |
| apply button `href` | `applyUrl` / `jobUrlDirect` | Resolved absolute; blank if none. |
| Static | `companyName` | `'Argo Space'` |
| Static | `companyUrl` | `'https://argospace.com'` |
| Static | `isRemote` | `false` |
| Static | `workFromHomeType` | `'On Site'` |

### Location parsing

- `El Segundo, CA (On-site)` → `{ city: 'El Segundo', state: 'CA', country: Country.USA }`.
- `Hermosa Beach, CA` (company HQ) is not a role location; role locations are all `El Segundo, CA`.

## Tests

- Load `__tests__/fixtures/argospace-careers.html` and assert 14 jobs are returned.
- Assert all 14 titles match the visible grouped list.
- Assert the hidden LinkedIn-only list is not included (no `linkedin.com/jobs/view` URLs from the flat list appear as `jobUrl`).
- Assert at least one full-time role has `applyUrl === 'https://www.linkedin.com/company/argo-space/jobs/'`.
- Assert the `Engineering Intern` role has an on-page apply URL (`#Apply-Now`).
- Assert filtering by `searchTerm`, `location`, `jobType`, and `resultsWanted` works as in other company plugins.
