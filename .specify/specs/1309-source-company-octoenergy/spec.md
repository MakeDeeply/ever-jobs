# Spec: 1309 — Source Company Plugin: Octopus Energy Group

| Field | Value |
| --- | --- |
| Spec ID | 1309 |
| Slug | source-company-octoenergy |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-octoenergy` for
**Octopus Energy Group** (Renewable-energy retailer and technology group serving households across multiple countries.). Sector: Energy / Utilities. HQ: London, England, United Kingdom.

The company's live postings are served by **Lever** on job board
`octoenergy` (`https://jobs.lever.co/octoenergy`), which exposed
**139 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-octoenergy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.OCTOPUS_ENERGY_GROUP`** in the source
> registry, so that a single `siteType: [Site.OCTOPUS_ENERGY_GROUP]` request returns
> Octopus Energy Group's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.OCTOPUS_ENERGY_GROUP = 'octoenergy'` to the `Site` enum. | must |
| FR-2 | `OctopusEnergyGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.OCTOPUS_ENERGY_GROUP, name: 'Octopus Energy Group', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'octoenergy' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.OCTOPUS_ENERGY_GROUP`, `companyName = 'Octopus Energy Group'`, `id` prefix `lever-`→`octoenergy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Renewable-focused energy retailer in multiple countries
- Operates the Kraken energy technology platform
- Hiring across energy markets, finance, and engineering
