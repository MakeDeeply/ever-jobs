# Spec: 986 — Source Company Plugin: Base Power Company

| Field | Value |
| --- | --- |
| Spec ID | 986 |
| Slug | source-company-basepowercompany |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-basepowercompany` for
**Base Power Company** (Deploys a network of distributed home batteries to strengthen the electric grid and provide backup power.). Sector: Grid / energy storage. HQ: Austin, Texas, USA.

The company's live postings are served by **Ashby** on job board
`base-power` (`https://jobs.ashbyhq.com/base-power`), which exposed
**159 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-basepowercompany` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.BASE_POWER_COMPANY`** in the source
> registry, so that a single `siteType: [Site.BASE_POWER_COMPANY]` request returns
> Base Power Company's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.BASE_POWER_COMPANY = 'basepowercompany'` to the `Site` enum. | must |
| FR-2 | `BasePowerCompanyService` implements `IScraper`, `@SourcePlugin({ site: Site.BASE_POWER_COMPANY, name: 'Base Power Company', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'base-power' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.BASE_POWER_COMPANY`, `companyName = 'Base Power Company'`, `id` prefix `ashby-`→`basepowercompany-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Builds and installs residential battery storage systems
- Operates a distributed network of home batteries coordinated as a grid resource
- Combines hardware manufacturing with a retail electricity plan
- Headquartered in Austin, Texas
