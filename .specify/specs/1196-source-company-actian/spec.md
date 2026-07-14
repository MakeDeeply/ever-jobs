# Spec: 1196 — Source Company Plugin: Actian

| Field | Value |
| --- | --- |
| Spec ID | 1196 |
| Slug | source-company-actian |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-actian` for
**Actian** (Data management and analytics vendor offering databases, data integration, and data warehouse products.). Sector: Databases & data management. HQ: Round Rock, Texas, United States.

The company's live postings are served by **Lever** on job board
`actian` (`https://jobs.lever.co/actian`), which exposed
**15 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-actian` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ACTIAN`** in the source
> registry, so that a single `siteType: [Site.ACTIAN]` request returns
> Actian's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ACTIAN = 'actian'` to the `Site` enum. | must |
| FR-2 | `ActianService` implements `IScraper`, `@SourcePlugin({ site: Site.ACTIAN, name: 'Actian', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'actian' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ACTIAN`, `companyName = 'Actian'`, `id` prefix `lever-`→`actian-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Portfolio spans databases, data integration, and data warehouse/analytics products.
- Engineering hub in Round Rock, Texas with a global sales-engineering presence.
- Postings include streaming observability and database engineering roles.
