# Spec: 1270 — Source Company Plugin: Gridware

| Field | Value |
| --- | --- |
| Spec ID | 1270 |
| Slug | source-company-gridware |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-gridware` for
**Gridware** (Grid-monitoring company using pole-mounted sensors to detect electrical grid faults before they cause outages or wildfires.). Sector: Climate tech / Grid resilience. HQ: San Francisco, California, USA.

The company's live postings are served by **Lever** on job board
`gridware` (`https://jobs.lever.co/gridware`), which exposed
**26 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-gridware` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.GRIDWARE`** in the source
> registry, so that a single `siteType: [Site.GRIDWARE]` request returns
> Gridware's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.GRIDWARE = 'gridware'` to the `Site` enum. | must |
| FR-2 | `GridwareService` implements `IScraper`, `@SourcePlugin({ site: Site.GRIDWARE, name: 'Gridware', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'gridware' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.GRIDWARE`, `companyName = 'Gridware'`, `id` prefix `lever-`→`gridware-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Sensor hardware plus data platform for utility grid monitoring
- Focused on outage prevention and wildfire risk reduction
- Backed by climate-tech and Silicon Valley investors
