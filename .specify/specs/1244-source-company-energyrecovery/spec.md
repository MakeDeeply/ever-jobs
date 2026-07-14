# Spec: 1244 — Source Company Plugin: Energy Recovery

| Field | Value |
| --- | --- |
| Spec ID | 1244 |
| Slug | source-company-energyrecovery |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-energyrecovery` for
**Energy Recovery** (Manufacturer of pressure-exchanger energy-recovery devices for desalination and industrial refrigeration.). Sector: Energy efficiency / Water. HQ: San Leandro, California, USA.

The company's live postings are served by **Lever** on job board
`energyrecovery` (`https://jobs.lever.co/energyrecovery`), which exposed
**6 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-energyrecovery` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ENERGY_RECOVERY`** in the source
> registry, so that a single `siteType: [Site.ENERGY_RECOVERY]` request returns
> Energy Recovery's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ENERGY_RECOVERY = 'energyrecovery'` to the `Site` enum. | must |
| FR-2 | `EnergyRecoveryService` implements `IScraper`, `@SourcePlugin({ site: Site.ENERGY_RECOVERY, name: 'Energy Recovery', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'energyrecovery' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ENERGY_RECOVERY`, `companyName = 'Energy Recovery'`, `id` prefix `lever-`→`energyrecovery-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Pressure-exchanger devices reduce energy use in desalination
- Expanding technology into industrial refrigeration
- Publicly traded on Nasdaq
