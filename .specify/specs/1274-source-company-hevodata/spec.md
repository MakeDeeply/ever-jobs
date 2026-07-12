# Spec: 1274 — Source Company Plugin: Hevo Data

| Field | Value |
| --- | --- |
| Spec ID | 1274 |
| Slug | source-company-hevodata |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-hevodata` for
**Hevo Data** (No-code data pipeline platform for automated data integration.). Sector: B2B SaaS / Data Integration. HQ: Bengaluru, Karnataka, India.

The company's live postings are served by **Lever** on job board
`hevodata` (`https://jobs.lever.co/hevodata`), which exposed
**37 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-hevodata` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HEVO_DATA`** in the source
> registry, so that a single `siteType: [Site.HEVO_DATA]` request returns
> Hevo Data's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HEVO_DATA = 'hevodata'` to the `Site` enum. | must |
| FR-2 | `HevoDataService` implements `IScraper`, `@SourcePlugin({ site: Site.HEVO_DATA, name: 'Hevo Data', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'hevodata' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HEVO_DATA`, `companyName = 'Hevo Data'`, `id` prefix `lever-`→`hevodata-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- No-code ELT/data pipeline platform
- Teams based in Bangalore and Pune, India
- Roles across sales, solutions engineering, and analytics
