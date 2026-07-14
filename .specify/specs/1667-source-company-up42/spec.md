# Spec: 1667 — Source Company Plugin: UP42

| Field | Value |
| --- | --- |
| Spec ID | 1667 |
| Slug | source-company-up42 |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-up42` for **UP42** (Geospatial marketplace and platform for ordering and analyzing Earth-observation data.). Sector:
Geospatial data platform / SaaS. HQ: Berlin, Germany.

The company's live postings are served by **Recruitee** on subdomain
`up42gmbh` (`https://up42gmbh.recruitee.com`), which exposed
**6 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-up42` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.UP42`** in the source
> registry, so that a single `siteType: [Site.UP42]` request returns
> UP42's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.UP42 = 'up42'` to the `Site` enum. | must |
| FR-2 | `UP42Service` implements `IScraper`, `@SourcePlugin({ site: Site.UP42, name: 'UP42', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'up42gmbh' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.UP42`, `companyName = 'UP42'`, `id` prefix `recruitee-`→`up42-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board at up42gmbh.recruitee.com with 6 open offers
- Serves agriculture, energy, infrastructure, and disaster-response use cases
- Part of Neo Space Group as of 2025
