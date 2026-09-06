# Spec: 5103 — Source Company Plugin: ThinkOrbital

| Field | Value |
|-------|-------|
| Spec ID | 5103 |
| Slug | source-company-thinkorbital |
| Status | complete |
| Owner | devin |
| Created | 2026-09-04 |

## 1. Problem Statement

ThinkOrbital (`thinkorbital.com/careers/`) uses a static WordPress/Elementor careers page with an accordion widget for open roles. The page has no JSON-LD `JobPosting` data and no recognizable ATS, so generic ATS detection does not find jobs there. The visible accordion lists three Boulder, Colorado engineering roles; a second accordion widget is hidden on every breakpoint and contains duplicate or draft listings that should not be emitted.

## 2. Goals

- Add a `source-company-thinkorbital` plugin that scrapes `https://thinkorbital.com/careers/`.
- Extract the three visible accordion entries (title, location, employment type, salary range, description).
- Ignore any widget whose class list contains all three `elementor-hidden-desktop`, `elementor-hidden-tablet`, and `elementor-hidden-mobile` tokens.
- Build a markdown description from the labeled `<p>` sections inside each accordion panel.
- Expose `companyName: 'ThinkOrbital'`, `companyUrl`/`jobUrl` pointing to the careers page.
- Leave `applyUrl` unset because the public page exposes no per-job application destination at the time of this spec.
- Honor `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted` filters.

## 3. Non-Goals

- No new ATS plugin; this is a company-specific Elementor parser.
- No headless browser; the page is static HTML.
- No fake apply URL or email; the gap will be reported separately.
- No salary/compensation extraction beyond the plain-text salary range in the description.

## 4. Caller Stories

> As a caller, I want `siteType: ["thinkorbital"]` to return the visible ThinkOrbital open roles.

> As a caller, I want `companyDomain: "thinkorbital.com"` to resolve to the `thinkorbital` plugin.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Plugin fetches `https://thinkorbital.com/careers/` with the shared `HttpClient`. | must |
| FR-2 | Plugin selects the visible `elementor-widget-accordion` and skips any ancestor with all three `elementor-hidden-*` classes. | must |
| FR-3 | Each `.elementor-accordion-item` yields one job; title is read from `.elementor-accordion-title`. | must |
| FR-4 | Job body is parsed from `.elementor-tab-content` labeled paragraphs (`Job Title:`, `Location:`, `Employment Type:`, `Salary Range:`, `About ThinkOrbital:`, `Position Summary:`, `Key Responsibilities:`, `Mandatory Qualifications:`, `Desired Qualifications:`, `What We Offer:`). | must |
| FR-5 | `Location:` text is parsed into a `LocationDto` (`Boulder`, `CO`, `USA`). | must |
| FR-6 | `Employment Type:` is stored as `employmentType` and mapped to `jobType` (`Full-time` → `[JobType.FULL_TIME]`). | must |
| FR-7 | `Salary Range:` text is included in the markdown description; `compensation` is left unset. | should |
| FR-8 | Description markdown is built by converting the labeled sections after `About ThinkOrbital:` into headings and content. | must |
| FR-9 | `companyName` is `'ThinkOrbital'`, `companyUrl` and `jobUrl` point to `https://thinkorbital.com/careers/`. | must |
| FR-10 | `applyUrl` is omitted because the page has no per-job application destination. | must |
| FR-11 | Plugin honors `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted` filters. | must |
| FR-12 | Plugin declares `companyDomains: ['thinkorbital.com', 'www.thinkorbital.com']`. | must |

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Single HTTP request per scrape. | one GET |
| NFR-2 | Self-contained plugin package with unit tests. | `__tests__/` |
| NFR-3 | No `console.log` in production code. | lint |

## 7. Contracts

### 7.1 `ThinkorbitalService.scrape(input: ScraperInputDto): Promise<JobResponseDto>`

```ts
const companyUrl = input.companyUrl || THINKORBITAL_CAREERS_URL;
const client = createHttpClient({ requestTimeout: input.requestTimeout ?? THINKORBITAL_DEFAULT_TIMEOUT_SECONDS });
const res = await client.get<string>(companyUrl);
const $ = cheerio.load(res.data);
const jobs = this.parsePage($, companyUrl);
return new JobResponseDto(this.applyInput(jobs, input));
```

### 7.2 Visible accordion selection

1. Select all `div.elementor-widget-accordion`.
2. Filter out widgets whose class list contains all three tokens `elementor-hidden-desktop`, `elementor-hidden-tablet`, `elementor-hidden-mobile`.
3. Use the first remaining widget.

### 7.3 Per-job parsing

1. Title: `this.normalize($item.find('.elementor-accordion-title').first().text())`.
2. Body: `$item.find('.elementor-tab-content').first()`.
3. Iterate body child nodes. When a node text matches one of the known labels, record the following non-empty sibling text as the value for that label.
4. Skip empty/whitespace-only nodes and `&nbsp;` paragraphs.

### 7.4 Job mapping

- `id`: `thinkorbital-${this.slugFromTitle(title)}`
- `site`: `Site.THINKORBITAL`
- `companyName`: `'ThinkOrbital'`
- `companyUrl`: input `companyUrl` or `https://thinkorbital.com/careers/`
- `jobUrl`: same as `companyUrl`
- `jobUrlDirect`: same as `companyUrl`
- `applyUrl`: omitted
- `title`: from accordion title / `Job Title:` body field
- `location`: parsed from `Location:` (Boulder, Colorado → city `Boulder`, state `CO`, country `Country.USA`)
- `employmentType`: `Full-time`
- `jobType`: `[JobType.FULL_TIME]`
- `isRemote`: `false`
- `workFromHomeType`: `'On Site'`
- `description`: markdown built from `About ThinkOrbital:`, `Position Summary:`, `Key Responsibilities:`, `Mandatory Qualifications:`, `Desired Qualifications:`, `What We Offer:`

## 8. Test Plan

- Unit: `__tests__/thinkorbital.service.spec.ts` with a fixture of the cached `https://thinkorbital.com/careers/` HTML.
  - Assert 3 visible jobs are returned.
  - Assert titles include `Assembly Integration and Test Engineer`, `Electrical Engineer`, `Lead Avionics Software Engineer`.
  - Assert each job has `site: Site.THINKORBITAL`, `companyName: 'ThinkOrbital'`, `companyUrl: 'https://thinkorbital.com/careers/'`.
  - Assert `applyUrl` is undefined/null.
  - Assert locations are `Boulder, CO, USA`.
  - Assert hidden accordion entries (e.g. `Senior Mechanical Engineer`, `Vice President of Government Affairs & Strategic Partnerships`, `Drone Software Engineer`) are not returned.
  - Assert `searchTerm` filters by title and description.
  - Assert `location` filter matches `Boulder`.
  - Assert `offset` and `resultsWanted` slice correctly.
- Type check: `npx tsc --noEmit -p packages/plugins/source-company-thinkorbital/tsconfig.json`
- Broad sanity: `npx tsc --noEmit -p apps/api/tsconfig.json`
- Focused tests: `npx jest --testPathPatterns thinkorbital`

## 9. Open Questions

- The visible role count on the live page may change; the fixture used for unit tests currently contains three visible accordion items.
- `applyUrl` may be added later if ThinkOrbital provides a per-job application link or email.

## 10. References

- `packages/plugins/source-company-thinkorbital/src/thinkorbital.service.ts`
- `packages/plugins/source-company-thinkorbital/src/thinkorbital.module.ts`
- `packages/plugins/source-company-thinkorbital/src/thinkorbital.constants.ts`
- `packages/plugins/source-company-thinkorbital/src/index.ts`
- `packages/plugins/source-company-thinkorbital/__tests__/thinkorbital.service.spec.ts`
- `packages/plugins/source-company-thespaceportcompany/src/thespaceportcompany.service.ts` (reference Elementor parser patterns)
