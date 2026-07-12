# Spec: 1268 — Source Company Plugin: Gravis Robotics

| Field | Value |
| --- | --- |
| Spec ID | 1268 |
| Slug | source-company-gravisrobotics |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-gravisrobotics` for
**Gravis Robotics** (Autonomous control systems for construction and earth-moving machinery.). Sector: Robotics. HQ: Zurich, Zurich, Switzerland.

The company's live postings are served by **Lever** on job board
`gravisrobotics` (`https://jobs.lever.co/gravisrobotics`), which exposed
**7 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-gravisrobotics` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.GRAVIS_ROBOTICS`** in the source
> registry, so that a single `siteType: [Site.GRAVIS_ROBOTICS]` request returns
> Gravis Robotics's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.GRAVIS_ROBOTICS = 'gravisrobotics'` to the `Site` enum. | must |
| FR-2 | `GravisRoboticsService` implements `IScraper`, `@SourcePlugin({ site: Site.GRAVIS_ROBOTICS, name: 'Gravis Robotics', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'gravisrobotics' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.GRAVIS_ROBOTICS`, `companyName = 'Gravis Robotics'`, `id` prefix `lever-`→`gravisrobotics-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Autonomy for construction and earth-moving machinery
- Focus on SLAM and field robotics
- Hiring field robotics and autonomous-excavation engineers
