# Spec: 1295 — Source Company Plugin: Loft Orbital Solutions

| Field | Value |
| --- | --- |
| Spec ID | 1295 |
| Slug | source-company-loftorbital |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-loftorbital` for
**Loft Orbital Solutions** (Space infrastructure company offering satellite missions as a service.). Sector: Space/Aerospace. HQ: San Francisco, California, United States.

The company's live postings are served by **Lever** on job board
`loftorbital` (`https://jobs.lever.co/loftorbital`), which exposed
**57 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-loftorbital` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LOFT_ORBITAL_SOLUTIONS`** in the source
> registry, so that a single `siteType: [Site.LOFT_ORBITAL_SOLUTIONS]` request returns
> Loft Orbital Solutions's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LOFT_ORBITAL_SOLUTIONS = 'loftorbital'` to the `Site` enum. | must |
| FR-2 | `LoftOrbitalSolutionsService` implements `IScraper`, `@SourcePlugin({ site: Site.LOFT_ORBITAL_SOLUTIONS, name: 'Loft Orbital Solutions', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'loftorbital' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LOFT_ORBITAL_SOLUTIONS`, `companyName = 'Loft Orbital Solutions'`, `id` prefix `lever-`→`loftorbital-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Offers standardized satellite missions as a service
- Operates spacecraft and mission-operations software
- Global footprint across US, Europe, and UAE
