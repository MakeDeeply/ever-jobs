# Spec: 1508 — Source Company Plugin: Office Depot

| Field | Value |
| --- | --- |
| Spec ID | 1508 |
| Slug | source-company-officedepot |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-officedepot` for **Office Depot** (Office products and business supplies retailer operating stores and e-commerce under Office Depot and OfficeMax.). Sector:
Retail (office products & business supplies). HQ: Boca Raton, Florida, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `OfficeDepot` (`https://jobs.smartrecruiters.com/OfficeDepot`),
which exposed **87 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-officedepot` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.OFFICE_DEPOT`** in the source
> registry, so that a single `siteType: [Site.OFFICE_DEPOT]` request returns
> Office Depot's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.OFFICE_DEPOT = 'officedepot'` to the `Site` enum. | must |
| FR-2 | `OfficeDepotService` implements `IScraper`, `@SourcePlugin({ site: Site.OFFICE_DEPOT, name: 'Office Depot', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'OfficeDepot' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.OFFICE_DEPOT`, `companyName = 'Office Depot'`, `id` prefix `sr-`→`officedepot-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Office products and business supplies retailer
- Operates Office Depot and OfficeMax stores
- Part of The ODP Corporation
- Retail stores plus e-commerce and B2B services
