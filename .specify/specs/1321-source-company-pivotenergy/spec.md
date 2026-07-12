# Spec: 1321 — Source Company Plugin: Pivot Energy

| Field | Value |
| --- | --- |
| Spec ID | 1321 |
| Slug | source-company-pivotenergy |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-pivotenergy` for
**Pivot Energy** (Solar and energy-storage developer, owner, and operator focused on community and commercial solar.). Sector: Renewable energy / Solar. HQ: Denver, Colorado, USA.

The company's live postings are served by **Lever** on job board
`pivotenergy` (`https://jobs.lever.co/pivotenergy`), which exposed
**7 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-pivotenergy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PIVOT_ENERGY`** in the source
> registry, so that a single `siteType: [Site.PIVOT_ENERGY]` request returns
> Pivot Energy's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PIVOT_ENERGY = 'pivotenergy'` to the `Site` enum. | must |
| FR-2 | `PivotEnergyService` implements `IScraper`, `@SourcePlugin({ site: Site.PIVOT_ENERGY, name: 'Pivot Energy', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'pivotenergy' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PIVOT_ENERGY`, `companyName = 'Pivot Energy'`, `id` prefix `lever-`→`pivotenergy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Community and commercial solar developer and operator
- In-house project finance and O&M functions
- Denver-headquartered with hybrid roles
