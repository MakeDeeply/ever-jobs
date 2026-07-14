# Spec: 1221 — Source Company Plugin: Commonwealth Fusion Systems

| Field | Value |
| --- | --- |
| Spec ID | 1221 |
| Slug | source-company-cfsenergy |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-cfsenergy` for
**Commonwealth Fusion Systems** (Private fusion-energy company developing a compact tokamak reactor using high-temperature superconducting magnets.). Sector: Clean energy / Fusion. HQ: Devens, Massachusetts, USA.

The company's live postings are served by **Lever** on job board
`cfsenergy` (`https://jobs.lever.co/cfsenergy`), which exposed
**58 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-cfsenergy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.COMMONWEALTH_FUSION_SYSTEMS`** in the source
> registry, so that a single `siteType: [Site.COMMONWEALTH_FUSION_SYSTEMS]` request returns
> Commonwealth Fusion Systems's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.COMMONWEALTH_FUSION_SYSTEMS = 'cfsenergy'` to the `Site` enum. | must |
| FR-2 | `CommonwealthFusionSystemsService` implements `IScraper`, `@SourcePlugin({ site: Site.COMMONWEALTH_FUSION_SYSTEMS, name: 'Commonwealth Fusion Systems', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'cfsenergy' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.COMMONWEALTH_FUSION_SYSTEMS`, `companyName = 'Commonwealth Fusion Systems'`, `id` prefix `lever-`→`cfsenergy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Compact tokamak fusion using HTS magnets
- Facilities in Devens and Milpitas
- Hiring across manufacturing, procurement, and operations
