# Spec: 1137 — Source Company Plugin: Overview Energy

| Field | Value |
| --- | --- |
| Spec ID | 1137 |
| Slug | source-company-overviewenergy |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-overviewenergy` for
**Overview Energy** (Develops satellites that beam solar energy to terrestrial solar farms so they can generate power around the clock.). Sector: Space-based solar power. HQ: USA.

The company's live postings are served by **Ashby** on job board
`overviewenergy` (`https://jobs.ashbyhq.com/overviewenergy`), which exposed
**9 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-overviewenergy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.OVERVIEW_ENERGY`** in the source
> registry, so that a single `siteType: [Site.OVERVIEW_ENERGY]` request returns
> Overview Energy's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.OVERVIEW_ENERGY = 'overviewenergy'` to the `Site` enum. | must |
| FR-2 | `OverviewEnergyService` implements `IScraper`, `@SourcePlugin({ site: Site.OVERVIEW_ENERGY, name: 'Overview Energy', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'overviewenergy' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.OVERVIEW_ENERGY`, `companyName = 'Overview Energy'`, `id` prefix `ashby-`→`overviewenergy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Developing satellites to beam solar energy from space to the grid
- Transmits power as near-infrared light to existing solar farms
- Demonstrated airborne power-beaming from an aircraft
- Aims to make solar a 24/7 firm energy resource
