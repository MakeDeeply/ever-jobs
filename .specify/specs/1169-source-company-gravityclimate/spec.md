# Spec: 1169 — Source Company Plugin: Gravity Climate

| Field | Value |
| --- | --- |
| Spec ID | 1169 |
| Slug | source-company-gravityclimate |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-gravityclimate` for
**Gravity Climate** (Provides software for industrial companies to measure and manage carbon emissions and energy use.). Sector: Carbon / energy management software. HQ: San Francisco, California, USA.

The company's live postings are served by **Ashby** on job board
`gravityclimate` (`https://jobs.ashbyhq.com/gravityclimate`), which exposed
**5 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-gravityclimate` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.GRAVITY_CLIMATE`** in the source
> registry, so that a single `siteType: [Site.GRAVITY_CLIMATE]` request returns
> Gravity Climate's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.GRAVITY_CLIMATE = 'gravityclimate'` to the `Site` enum. | must |
| FR-2 | `GravityClimateService` implements `IScraper`, `@SourcePlugin({ site: Site.GRAVITY_CLIMATE, name: 'Gravity Climate', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'gravityclimate' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.GRAVITY_CLIMATE`, `companyName = 'Gravity Climate'`, `id` prefix `ashby-`→`gravityclimate-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Carbon accounting and energy management software
- Targets industrial businesses and their supply chains
- Supports emissions tracking and decarbonization planning
- Headquartered in San Francisco
