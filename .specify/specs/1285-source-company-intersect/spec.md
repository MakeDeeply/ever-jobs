# Spec: 1285 — Source Company Plugin: Intersect Power

| Field | Value |
| --- | --- |
| Spec ID | 1285 |
| Slug | source-company-intersect |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-intersect` for
**Intersect Power** (Develops and operates large-scale clean power and integrated energy infrastructure for industrial and data-center demand.). Sector: Renewable energy / Clean power. HQ: San Francisco, California, USA.

The company's live postings are served by **Lever** on job board
`intersect` (`https://jobs.lever.co/intersect`), which exposed
**38 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-intersect` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.INTERSECT_POWER`** in the source
> registry, so that a single `siteType: [Site.INTERSECT_POWER]` request returns
> Intersect Power's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.INTERSECT_POWER = 'intersect'` to the `Site` enum. | must |
| FR-2 | `IntersectPowerService` implements `IScraper`, `@SourcePlugin({ site: Site.INTERSECT_POWER, name: 'Intersect Power', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'intersect' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.INTERSECT_POWER`, `companyName = 'Intersect Power'`, `id` prefix `lever-`→`intersect-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Utility-scale solar, wind, and storage developer
- Co-locates generation with industrial and data-center load
- Remote roles across asset management and compliance
