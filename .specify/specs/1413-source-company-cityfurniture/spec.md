# Spec: 1413 — Source Company Plugin: City Furniture

| Field | Value |
| --- | --- |
| Spec ID | 1413 |
| Slug | source-company-cityfurniture |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-cityfurniture` for **City Furniture** (Home furnishings retailer operating furniture showrooms in Florida.). Sector:
Home furnishings retail. HQ: Tamarac, Florida, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `CityFurniture1` (`https://jobs.smartrecruiters.com/CityFurniture1`),
which exposed **6 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-cityfurniture` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CITY_FURNITURE`** in the source
> registry, so that a single `siteType: [Site.CITY_FURNITURE]` request returns
> City Furniture's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CITY_FURNITURE = 'cityfurniture'` to the `Site` enum. | must |
| FR-2 | `CityFurnitureService` implements `IScraper`, `@SourcePlugin({ site: Site.CITY_FURNITURE, name: 'City Furniture', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'CityFurniture1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CITY_FURNITURE`, `companyName = 'City Furniture'`, `id` prefix `sr-`→`cityfurniture-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Home furnishings retailer
- Operates showrooms across Florida
- Includes Ashley HomeStore locations
- Physical stores plus e-commerce
