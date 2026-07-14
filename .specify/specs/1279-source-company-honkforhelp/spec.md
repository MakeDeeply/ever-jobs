# Spec: 1279 — Source Company Plugin: HONK

| Field | Value |
| --- | --- |
| Spec ID | 1279 |
| Slug | source-company-honkforhelp |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-honkforhelp` for
**HONK** (Roadside assistance and vehicle transport technology platform.). Sector: logistics. HQ: Los Angeles, California, United States.

The company's live postings are served by **Lever** on job board
`honkforhelp` (`https://jobs.lever.co/honkforhelp`), which exposed
**5 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-honkforhelp` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HONK`** in the source
> registry, so that a single `siteType: [Site.HONK]` request returns
> HONK's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HONK = 'honkforhelp'` to the `Site` enum. | must |
| FR-2 | `HONKService` implements `IScraper`, `@SourcePlugin({ site: Site.HONK, name: 'HONK', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'honkforhelp' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HONK`, `companyName = 'HONK'`, `id` prefix `lever-`→`honkforhelp-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Roadside assistance and vehicle transport platform
- Connects drivers, insurers and service networks
- Hiring operations and network growth roles
