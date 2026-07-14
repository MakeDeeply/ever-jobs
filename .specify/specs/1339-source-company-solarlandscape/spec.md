# Spec: 1339 — Source Company Plugin: Solar Landscape

| Field | Value |
| --- | --- |
| Spec ID | 1339 |
| Slug | source-company-solarlandscape |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-solarlandscape` for
**Solar Landscape** (Commercial and community rooftop solar developer building distributed generation and battery storage across the US.). Sector: Renewable energy / Solar. HQ: Asbury Park, New Jersey, USA.

The company's live postings are served by **Lever** on job board
`solarlandscape` (`https://jobs.lever.co/solarlandscape`), which exposed
**28 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-solarlandscape` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SOLAR_LANDSCAPE`** in the source
> registry, so that a single `siteType: [Site.SOLAR_LANDSCAPE]` request returns
> Solar Landscape's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SOLAR_LANDSCAPE = 'solarlandscape'` to the `Site` enum. | must |
| FR-2 | `SolarLandscapeService` implements `IScraper`, `@SourcePlugin({ site: Site.SOLAR_LANDSCAPE, name: 'Solar Landscape', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'solarlandscape' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SOLAR_LANDSCAPE`, `companyName = 'Solar Landscape'`, `id` prefix `lever-`→`solarlandscape-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Commercial rooftop and community solar developer
- Expanding into front-of-meter battery energy storage
- Operates in over a dozen US states
