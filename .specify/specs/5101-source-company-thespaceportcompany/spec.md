# Spec: 5101 — Source Company Plugin: The Spaceport Company

| Field | Value |
|-------|-------|
| Spec ID | 5101 |
| Slug | source-company-thespaceportcompany |
| Status | in-progress |
| Owner | devin |
| Created | 2026-09-03 |
| Supersedes | (none) |
| Related specs | 5069 (Spec-Kit naming convention), 5099 (source-company-launchpadbuild_ai plugin scaffold) |

## 1. Problem Statement

The Spaceport Company careers page (`https://thespaceportcompany.com/careers/`) is a static WordPress/Elementor page with email-to-apply job listings. No recognizable ATS URL, JSON-LD `JobPosting`, or embedded job-board script is present, so the generic upstream classifier reports "jobs page found, no recognized ATS". The page needs a dedicated company plugin to parse the visible job listings.

## 2. Goals

- Add a `source-company-thespaceportcompany` plugin that scrapes the public careers page.
- Return one `JobPostDto` for each visible job section.
- Skip Elementor sections that are hidden on all breakpoints (`elementor-hidden-desktop elementor-hidden-tablet elementor-hidden-mobile`) so only currently displayed jobs are emitted.
- Extract title, location, description, and apply URL for each listing.
- Register the plugin in the canonical four files.

## 3. Non-Goals

- No headless-browser dependency; the page is static and served in the initial HTML.
- No ATS detection logic in this plugin.
- No compensation parsing (the page contains no salary or equity information).
- No pagination or search API; the plugin scrapes a single page.

## 4. Caller Stories

> As a caller, I want `siteType: ["thespaceportcompany"]` to return the visible job postings from `https://thespaceportcompany.com/careers/`.

> As a caller, I want `location: "Merritt Island"` to filter the Mechanical Engineer role and `location: "Cocoa"` to filter the Naval Architect role.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Plugin fetches `https://thespaceportcompany.com/careers/` with the shared `HttpClient`. | must |
| FR-2 | Plugin iterates `section.elementor-top-section` elements that appear after the "Open Positions" heading section and selects only those that contain a `p` job title, an `elementor-widget-accordion`, and an `elementor-button` with `href="mailto:info@thespaceportcompany.com"`. | must |
| FR-3 | Sections whose class list contains all three `elementor-hidden-desktop`, `elementor-hidden-tablet`, and `elementor-hidden-mobile` tokens are ignored. | must |
| FR-4 | Title is taken from the first `<p>` inside the first `elementor-widget-text-editor` child of the section. | must |
| FR-5 | Location is parsed from the first `<ul><li>` in the metadata widget: prefer the phrase "This role will be in the `<city>` location", otherwise fall back to "headquartered in `<city>`, `<state>`". State is normalized to two-letter uppercase. Country is `USA`. | must |
| FR-6 | Description is built as markdown from the following `elementor-widget-text-editor` overview paragraphs and each `elementor-accordion-item` (heading + `<ul>` contents). | must |
| FR-7 | `applyUrl` is `mailto:info@thespaceportcompany.com`. | must |
| FR-8 | `jobUrl` is `https://thespaceportcompany.com/careers/`. | must |
| FR-9 | `jobType` is `[JobType.FULL_TIME]`, `employmentType` is `"Full time"`, `isRemote` is `false`, and `workFromHomeType` is `"On Site"`. | must |
| FR-10 | Plugin honors `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted` filters from `ScraperInputDto`. | should |
| FR-11 | `companyName` is `"The Spaceport Company"` and `companyUrl` is `https://thespaceportcompany.com/careers/`. | must |

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Single HTTP request per scrape. | zero extra requests |
| NFR-2 | Plugin package is self-contained. | unit tests in `__tests__/` |
| NFR-3 | No `console.log` in production code. | lint |

## 7. Contracts

### 7.1 `TheSpaceportcompanyService.scrape(input: ScraperInputDto): Promise<JobResponseDto>`

```ts
const client = createHttpClient({ requestTimeout: input.requestTimeout ?? DEFAULT_TIMEOUT });
const res = await client.get<string>(CAREERS_URL);
const $ = cheerio.load(res.data);
const jobs = this.parsePage($, input);
return new JobResponseDto(jobs);
```

### 7.2 Section selection

- Start from `section[data-id="69967ee"]` ("Open Positions").
- Iterate following siblings that are `section.elementor-top-section`.
- Skip if `class` contains all three `elementor-hidden-desktop`, `elementor-hidden-tablet`, `elementor-hidden-mobile`.
- Skip if no `p` text, no accordion, or no `mailto:info@thespaceportcompany.com` apply link.

### 7.3 Location parsing

```ts
const roleMatch = text.match(/This role will be in the ([^<\n]+?) location/i);
const hqMatch = text.match(/headquartered in ([^<,\n]+),\s*([A-Za-z]{2})/i);
const city = roleMatch?.[1].trim() ?? hqMatch?.[1].trim() ?? null;
const state = hqMatch?.[2].trim().toUpperCase() ?? null;
return new LocationDto({ city, state, country: Country.USA });
```

### 7.4 Description building

- Overview: the `elementor-widget-text-editor` that sits between the metadata widget and the accordion.
- For each `.elementor-accordion-item`:
  - heading from `.elementor-accordion-title`.
  - content from `.elementor-tab-content` HTML converted to markdown.
- Join with `## {heading}` lines.

## 8. Test Plan

- Unit: `__tests__/thespaceportcompany.service.spec.ts` with a cached `careers.html` fixture.
  - Mocks `@ever-jobs/common` `createHttpClient`.
  - Asserts exactly 2 jobs are returned with titles `Mechanical Engineer` and `Naval Architect`.
  - Asserts hidden draft sections (`Propulsion Engineer`, `Electrical Engineer`) are not emitted.
  - Asserts each returned job has `applyUrl` equal to `mailto:info@thespaceportcompany.com`.
  - Asserts `site` is `Site.THE_SPACEPORT_COMPANY`.
  - Tests `searchTerm`, `location`, `offset`, and `resultsWanted` filters.
- Type check: `npx tsc --noEmit -p packages/plugins/source-company-thespaceportcompany/tsconfig.json`
- Broad sanity: `npx tsc --noEmit -p apps/api/tsconfig.json`
- Focused tests: `npx jest --testPathPatterns thespaceportcompany`

## 9. Open Questions

(none)

## 10. Decisions

- The plugin returns the two visible roles; hidden Elementor draft sections are intentionally skipped.
- `jobUrl` points to the careers landing page because the site has no per-job detail pages.
- `applyUrl` uses the same `mailto` link for every role, which matches the page's design.

## 11. References

- `packages/plugins/source-company-thespaceportcompany/src/thespaceportcompany.service.ts`
- `packages/plugins/source-company-thespaceportcompany/src/thespaceportcompany.module.ts`
- `packages/plugins/source-company-thespaceportcompany/src/thespaceportcompany.constants.ts`
- `packages/plugins/source-company-thespaceportcompany/src/index.ts`
- `packages/plugins/source-company-thespaceportcompany/__tests__/thespaceportcompany.service.spec.ts`
