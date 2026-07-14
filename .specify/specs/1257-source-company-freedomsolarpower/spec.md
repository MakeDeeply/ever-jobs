# Spec: 1257 — Source Company Plugin: Freedom Solar Power

| Field | Value |
| --- | --- |
| Spec ID | 1257 |
| Slug | source-company-freedomsolarpower |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-freedomsolarpower` for
**Freedom Solar Power** (Residential and commercial solar installation company operating primarily in Texas and Florida.). Sector: Renewable energy / Solar. HQ: Austin, Texas, USA.

The company's live postings are served by **Lever** on job board
`freedomsolarpower` (`https://jobs.lever.co/freedomsolarpower`), which exposed
**27 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-freedomsolarpower` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FREEDOM_SOLAR_POWER`** in the source
> registry, so that a single `siteType: [Site.FREEDOM_SOLAR_POWER]` request returns
> Freedom Solar Power's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FREEDOM_SOLAR_POWER = 'freedomsolarpower'` to the `Site` enum. | must |
| FR-2 | `FreedomSolarPowerService` implements `IScraper`, `@SourcePlugin({ site: Site.FREEDOM_SOLAR_POWER, name: 'Freedom Solar Power', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'freedomsolarpower' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FREEDOM_SOLAR_POWER`, `companyName = 'Freedom Solar Power'`, `id` prefix `lever-`→`freedomsolarpower-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Residential and commercial solar installer
- Residential footprint in Texas and Florida
- Skilled-trades and electrician hiring
