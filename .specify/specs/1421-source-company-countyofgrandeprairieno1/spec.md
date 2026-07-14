# Spec: 1421 — Source Company Plugin: County of Grande Prairie No. 1

| Field | Value |
| --- | --- |
| Spec ID | 1421 |
| Slug | source-company-countyofgrandeprairieno1 |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-countyofgrandeprairieno1` for **County of Grande Prairie No. 1** (Municipal district government in Alberta, Canada.). Sector:
Government / public sector (local government). HQ: Grande Prairie, Alberta, Canada.

The company's live postings are served by **SmartRecruiters** on company
identifier `CountyOfGrandePrairieNo1` (`https://jobs.smartrecruiters.com/CountyOfGrandePrairieNo1`),
which exposed **4 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-countyofgrandeprairieno1` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.COUNTY_OF_GRANDE_PRAIRIE_NO_1`** in the source
> registry, so that a single `siteType: [Site.COUNTY_OF_GRANDE_PRAIRIE_NO_1]` request returns
> County of Grande Prairie No. 1's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.COUNTY_OF_GRANDE_PRAIRIE_NO_1 = 'countyofgrandeprairieno1'` to the `Site` enum. | must |
| FR-2 | `CountyOfGrandePrairieNo1Service` implements `IScraper`, `@SourcePlugin({ site: Site.COUNTY_OF_GRANDE_PRAIRIE_NO_1, name: 'County of Grande Prairie No. 1', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'CountyOfGrandePrairieNo1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.COUNTY_OF_GRANDE_PRAIRIE_NO_1`, `companyName = 'County of Grande Prairie No. 1'`, `id` prefix `sr-`→`countyofgrandeprairieno1-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Municipal district in Alberta, Canada
- Provides public works and community services
- Roles include operational and administrative staff
