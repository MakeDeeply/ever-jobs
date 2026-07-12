# Spec: 1301 — Source Company Plugin: Metabase

| Field | Value |
| --- | --- |
| Spec ID | 1301 |
| Slug | source-company-metabase |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-metabase` for
**Metabase** (Open-source business intelligence and embedded analytics platform for exploring and sharing data.). Sector: Open-source data / business intelligence. HQ: Remote-first (US), United States.

The company's live postings are served by **Lever** on job board
`metabase` (`https://jobs.lever.co/metabase`), which exposed
**18 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-metabase` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.METABASE`** in the source
> registry, so that a single `siteType: [Site.METABASE]` request returns
> Metabase's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.METABASE = 'metabase'` to the `Site` enum. | must |
| FR-2 | `MetabaseService` implements `IScraper`, `@SourcePlugin({ site: Site.METABASE, name: 'Metabase', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'metabase' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.METABASE`, `companyName = 'Metabase'`, `id` prefix `lever-`→`metabase-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Open-source (self-hostable) analytics platform plus a hosted cloud offering
- Fully distributed, remote-first team
- Postings span engineering (Analytics Engineer, CI Engineer) and go-to-market roles
