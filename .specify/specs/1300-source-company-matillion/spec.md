# Spec: 1300 — Source Company Plugin: Matillion

| Field | Value |
| --- | --- |
| Spec ID | 1300 |
| Slug | source-company-matillion |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-matillion` for
**Matillion** (Cloud data integration and transformation platform (including its Maia AI data automation product).). Sector: Cloud data integration / ETL. HQ: Manchester, England, United Kingdom.

The company's live postings are served by **Lever** on job board
`matillion` (`https://jobs.lever.co/matillion`), which exposed
**23 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-matillion` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MATILLION`** in the source
> registry, so that a single `siteType: [Site.MATILLION]` request returns
> Matillion's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MATILLION = 'matillion'` to the `Site` enum. | must |
| FR-2 | `MatillionService` implements `IScraper`, `@SourcePlugin({ site: Site.MATILLION, name: 'Matillion', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'matillion' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MATILLION`, `companyName = 'Matillion'`, `id` prefix `lever-`→`matillion-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Cloud data integration / ELT platform for major cloud data warehouses
- Started in Manchester with teams across the UK, US, and India
- Postings include field engineering and enterprise sales roles
