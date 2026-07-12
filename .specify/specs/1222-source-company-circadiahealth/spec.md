# Spec: 1222 — Source Company Plugin: Circadia Health

| Field | Value |
| --- | --- |
| Spec ID | 1222 |
| Slug | source-company-circadiahealth |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-circadiahealth` for
**Circadia Health** (Medical device and data company for contactless remote patient monitoring.). Sector: Health Tech / Medical Device. HQ: Los Angeles, California, USA.

The company's live postings are served by **Lever** on job board
`circadiahealth` (`https://jobs.lever.co/circadiahealth`), which exposed
**23 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-circadiahealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CIRCADIA_HEALTH`** in the source
> registry, so that a single `siteType: [Site.CIRCADIA_HEALTH]` request returns
> Circadia Health's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CIRCADIA_HEALTH = 'circadiahealth'` to the `Site` enum. | must |
| FR-2 | `CircadiaHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.CIRCADIA_HEALTH, name: 'Circadia Health', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'circadiahealth' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CIRCADIA_HEALTH`, `companyName = 'Circadia Health'`, `id` prefix `lever-`→`circadiahealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- FDA-cleared contactless patient monitoring system
- Continuous vital-sign tracking via proprietary hardware
- Pairs devices with telehealth monitoring physicians
