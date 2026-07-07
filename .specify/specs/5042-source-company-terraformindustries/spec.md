# Spec: 5042 — source-company-terraformindustries

| Field | Value |
| --- | --- |
| Spec ID | 5042 |
| Slug | source-company-terraformindustries |
| Status | implemented |
| Plugin | `packages/plugins/source-company-terraformindustries` |
| Category | company |
| Related specs | 5002 (source-company-anatar, custom-HTML company scrape), 5001 (shared job-location parser) |

## Problem

There was no adapter for **Terraform Industries** (`terraformindustries.com`).
The company runs no third-party ATS. Its open roles are published in a hand-built
"Careers" section on the company home page as a flat list of anchor links — one
per role — each pointing at a Google Doc that holds the full job description.

Because there is no ATS API or structured board, enumeration has to come from the
home page markup, and per-role metadata (location, description) has to come from
each Google Doc. Google Docs expose a plain-text export endpoint
(`/document/d/{id}/export?format=txt`) that returns the document body without a
headless browser or authentication, which makes the roles scrapeable over plain
HTTP.

## Scope

- New company plugin `source-company-terraformindustries` implementing `IScraper`,
  decorated `@SourcePlugin({ site: Site.TERRAFORMINDUSTRIES, category: 'company' })`.
- Enumerate roles from the home page:
  - `GET https://terraformindustries.com/`.
  - Scope parsing to the markup after the `Careers` heading, then collect every
    `<a>` whose href points at `docs.google.com/document/...`.
  - Each anchor gives the role `title` (link text) and a Google Doc `docId`.
  - De-dupe by title.
- Enrich each distinct Google Doc once (bounded concurrency) via its plain-text
  export:
  - The export opens with a fixed header — company name, title,
    `terraformindustries.com`, then the location — followed by a blank line and
    the description body.
  - Use the `terraformindustries.com` domain line as the anchor: the next
    non-empty line is the location; the remainder is the description body.
- Emit `JobPostDto` per role: `id` (`terraformindustries-{title-slug}`), `title`,
  `companyName` (`Terraform Industries`), `companyUrl`, `jobUrl` (canonical doc
  URL), structured `location`, `isRemote`, `workFromHomeType` (when detected),
  `description`, `emails` (from the description). `datePosted` is `null` (the
  source carries no post date).
- Honor `ScraperInputDto`: `searchTerm` (title/description), `location`,
  `isRemote`, `jobType`, `offset`, `resultsWanted`.
- Register in the four required places (enum, `packages/plugins/index.ts`,
  `tsconfig.base.json`, `jest.config.js`).

## Non-goals

- No generic Google Docs scraper — this is Terraform-Industries-specific.
- No compensation / employment-type parsing: the job docs are free-form prose and
  do not carry structured salary or a consistent employment-type field, so those
  fields are left unset rather than guessed.
- No `datePosted`: the source exposes no posting date.
- No headless browser: the home page and the doc exports are both fetched over
  plain HTTP.
- No changes to existing company/ATS plugins.

## Contracts

- Input: `ScraperInputDto` (all fields optional; network/proxy fields respected).
- Output: `JobResponseDto` wrapping `JobPostDto[]`.
- External calls, all through the `@ever-jobs/common` HTTP client:
  - `GET https://terraformindustries.com/` (home page HTML).
  - `GET https://docs.google.com/document/d/{docId}/export?format=txt` per
    distinct doc (bounded concurrency).
- Failure handling: any home-page failure returns an empty list; an individual
  doc-export failure degrades that role to `location: null` /
  `description: null` (the role is still returned with title + jobUrl).

## Test plan

Mocked-HTTP unit tests (`__tests__/terraformindustries.service.spec.ts`):

- Module resolution + `Site.TERRAFORMINDUSTRIES` value.
- Enumerate careers-section roles and enrich each from its Google Doc (title, id
  slug, canonical jobUrl, structured location, description; description excludes
  the doc header).
- Ignore doc links that appear before the `Careers` heading and non-doc links.
- Fetch a shared job doc only once and reuse it across roles (request count).
- Derive `isRemote` from a `Remote` doc location.
- Degrade gracefully when a doc fetch fails (role returned, null enrichment).
- Empty list when the home page has no recognizable Careers list.
- `searchTerm` title filter.
- `offset` / `resultsWanted` slicing.
- Empty list when the home page request fails.
