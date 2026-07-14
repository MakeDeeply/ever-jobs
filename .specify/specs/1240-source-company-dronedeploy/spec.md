# Spec: 1240 — Source Company Plugin: DroneDeploy

| Field | Value |
| --- | --- |
| Spec ID | 1240 |
| Slug | source-company-dronedeploy |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-dronedeploy` for
**DroneDeploy** (Reality-capture platform combining drones, robotics, and AI for field teams.). Sector: Hardware/Drones. HQ: San Francisco, California, United States.

The company's live postings are served by **Lever** on job board
`dronedeploy` (`https://jobs.lever.co/dronedeploy`), which exposed
**11 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-dronedeploy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DRONEDEPLOY`** in the source
> registry, so that a single `siteType: [Site.DRONEDEPLOY]` request returns
> DroneDeploy's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DRONEDEPLOY = 'dronedeploy'` to the `Site` enum. | must |
| FR-2 | `DroneDeployService` implements `IScraper`, `@SourcePlugin({ site: Site.DRONEDEPLOY, name: 'DroneDeploy', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'dronedeploy' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DRONEDEPLOY`, `companyName = 'DroneDeploy'`, `id` prefix `lever-`→`dronedeploy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Reality-capture platform for aerial and ground robotics
- Serves construction, energy, and agriculture
- Hiring computer-vision and full-stack engineers
