# Spec: 1320 — Source Company Plugin: Pickle Robot Company

| Field | Value |
| --- | --- |
| Spec ID | 1320 |
| Slug | source-company-picklerobot |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-picklerobot` for
**Pickle Robot Company** (Autonomous robots that unload trucks and containers in warehouses and distribution centers.). Sector: Robotics. HQ: Charlestown, Massachusetts, United States.

The company's live postings are served by **Lever** on job board
`picklerobot` (`https://jobs.lever.co/picklerobot`), which exposed
**18 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-picklerobot` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PICKLE_ROBOT_COMPANY`** in the source
> registry, so that a single `siteType: [Site.PICKLE_ROBOT_COMPANY]` request returns
> Pickle Robot Company's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PICKLE_ROBOT_COMPANY = 'picklerobot'` to the `Site` enum. | must |
| FR-2 | `PickleRobotCompanyService` implements `IScraper`, `@SourcePlugin({ site: Site.PICKLE_ROBOT_COMPANY, name: 'Pickle Robot Company', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'picklerobot' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PICKLE_ROBOT_COMPANY`, `companyName = 'Pickle Robot Company'`, `id` prefix `lever-`→`picklerobot-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Specializes in truck and container unloading automation
- Combines robotics hardware with autonomy and perception software
- Hiring backend, autonomy, and DevOps engineers
