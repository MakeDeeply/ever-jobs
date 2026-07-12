# Spec: 1272 — Source Company Plugin: HappyCo

| Field | Value |
| --- | --- |
| Spec ID | 1272 |
| Slug | source-company-happyco |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-happyco` for
**HappyCo** (Real-time property data platform for the multifamily real-estate sector.). Sector: Property data platform. HQ: Adelaide, South Australia, Australia.

The company's live postings are served by **Lever** on job board
`happyco` (`https://jobs.lever.co/happyco`), which exposed
**14 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-happyco` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HAPPYCO`** in the source
> registry, so that a single `siteType: [Site.HAPPYCO]` request returns
> HappyCo's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HAPPYCO = 'happyco'` to the `Site` enum. | must |
| FR-2 | `HappyCoService` implements `IScraper`, `@SourcePlugin({ site: Site.HAPPYCO, name: 'HappyCo', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'happyco' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HAPPYCO`, `companyName = 'HappyCo'`, `id` prefix `lever-`→`happyco-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Real-time property data platform serving multifamily property management.
- Over five million residential units on its platform.
- Building a canonical entity model and property graph for analytics.
