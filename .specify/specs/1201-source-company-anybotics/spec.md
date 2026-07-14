# Spec: 1201 — Source Company Plugin: ANYbotics

| Field | Value |
| --- | --- |
| Spec ID | 1201 |
| Slug | source-company-anybotics |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-anybotics` for
**ANYbotics** (Builds autonomous legged inspection robots with AI/ML perception.). Sector: Applied AI / robotics. HQ: Zurich, Zurich, Switzerland.

The company's live postings are served by **Lever** on job board
`anybotics` (`https://jobs.lever.co/anybotics`), which exposed
**12 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-anybotics` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ANYBOTICS`** in the source
> registry, so that a single `siteType: [Site.ANYBOTICS]` request returns
> ANYbotics's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ANYBOTICS = 'anybotics'` to the `Site` enum. | must |
| FR-2 | `ANYboticsService` implements `IScraper`, `@SourcePlugin({ site: Site.ANYBOTICS, name: 'ANYbotics', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'anybotics' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ANYBOTICS`, `companyName = 'ANYbotics'`, `id` prefix `lever-`→`anybotics-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Builds the ANYmal legged inspection robot
- Uses camera- and LIDAR-based sensing with AI/ML perception
- Roles span AI/ML software, field service and sales
- Headquartered in Zurich with international field roles
