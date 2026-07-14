# Spec: 1336 — Source Company Plugin: Serotonin

| Field | Value |
| --- | --- |
| Spec ID | 1336 |
| Slug | source-company-serotonin |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-serotonin` for
**Serotonin** (Web3 marketing and product studio serving crypto and blockchain companies.). Sector: Web3 Services. HQ: New York, New York, United States.

The company's live postings are served by **Lever** on job board
`serotonin` (`https://jobs.lever.co/serotonin`), which exposed
**4 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-serotonin` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SEROTONIN`** in the source
> registry, so that a single `siteType: [Site.SEROTONIN]` request returns
> Serotonin's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SEROTONIN = 'serotonin'` to the `Site` enum. | must |
| FR-2 | `SerotoninService` implements `IScraper`, `@SourcePlugin({ site: Site.SEROTONIN, name: 'Serotonin', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'serotonin' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SEROTONIN`, `companyName = 'Serotonin'`, `id` prefix `lever-`→`serotonin-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Provides marketing and product services to Web3 companies.
- Builds smart-contract backends and blockchain data analytics.
- Lever postings include AI infra and blockchain data-analytics roles.
