# Spec: 1167 — Source Company Plugin: Electric Air

| Field | Value |
| --- | --- |
| Spec ID | 1167 |
| Slug | source-company-electricair |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-electricair` for
**Electric Air** (Installs heat pumps for home heating and cooling and builds its own heat pump platform.). Sector: Home electrification / heat pumps. HQ: San Francisco Bay Area, California, USA.

The company's live postings are served by **Ashby** on job board
`electricair` (`https://jobs.ashbyhq.com/electricair`), which exposed
**5 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-electricair` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ELECTRIC_AIR`** in the source
> registry, so that a single `siteType: [Site.ELECTRIC_AIR]` request returns
> Electric Air's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ELECTRIC_AIR = 'electricair'` to the `Site` enum. | must |
| FR-2 | `ElectricAirService` implements `IScraper`, `@SourcePlugin({ site: Site.ELECTRIC_AIR, name: 'Electric Air', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'electricair' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ELECTRIC_AIR`, `companyName = 'Electric Air'`, `id` prefix `ashby-`→`electricair-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Installs residential heat pumps in the Bay Area
- Developed an in-house heat pump platform called Redwood
- Focused on electrifying home heating and cooling
- Based in the San Francisco Bay Area
