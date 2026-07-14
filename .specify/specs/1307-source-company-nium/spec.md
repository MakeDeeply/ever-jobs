# Spec: 1307 — Source Company Plugin: Nium

| Field | Value |
| --- | --- |
| Spec ID | 1307 |
| Slug | source-company-nium |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-nium` for
**Nium** (Real-time cross-border payments infrastructure for banks and businesses.). Sector: Payments. HQ: San Francisco, California, United States.

The company's live postings are served by **Lever** on job board
`nium` (`https://jobs.lever.co/nium`), which exposed
**41 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-nium` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NIUM`** in the source
> registry, so that a single `siteType: [Site.NIUM]` request returns
> Nium's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NIUM = 'nium'` to the `Site` enum. | must |
| FR-2 | `NiumService` implements `IScraper`, `@SourcePlugin({ site: Site.NIUM, name: 'Nium', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'nium' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NIUM`, `companyName = 'Nium'`, `id` prefix `lever-`→`nium-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Network spans 190+ countries and supports 100 currencies.
- Holds regulatory licenses in 40+ jurisdictions.
- Dual headquarters in San Francisco and Singapore.
