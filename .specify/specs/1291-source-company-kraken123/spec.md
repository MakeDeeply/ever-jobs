# Spec: 1291 — Source Company Plugin: Kraken

| Field | Value |
| --- | --- |
| Spec ID | 1291 |
| Slug | source-company-kraken123 |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-kraken123` for
**Kraken** (Energy-tech platform providing utilities with customer management, billing, and flexibility-optimization software for the energy transition.). Sector: Energy software / Utilities. HQ: London, England, United Kingdom.

The company's live postings are served by **Lever** on job board
`kraken123` (`https://jobs.lever.co/kraken123`), which exposed
**44 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-kraken123` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.KRAKEN`** in the source
> registry, so that a single `siteType: [Site.KRAKEN]` request returns
> Kraken's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.KRAKEN = 'kraken123'` to the `Site` enum. | must |
| FR-2 | `KrakenService` implements `IScraper`, `@SourcePlugin({ site: Site.KRAKEN, name: 'Kraken', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'kraken123' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.KRAKEN`, `companyName = 'Kraken'`, `id` prefix `lever-`→`kraken123-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Customer and billing platform for energy utilities
- Focus on renewable generation and grid flexibility
- Deployed by utilities across multiple countries
