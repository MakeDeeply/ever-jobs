# Spec: 1232 — Source Company Plugin: Cyderes

| Field | Value |
| --- | --- |
| Spec ID | 1232 |
| Slug | source-company-cyderes |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-cyderes` for
**Cyderes** (Global managed cybersecurity services provider delivering managed detection and response, identity, and security engineering.). Sector: Cybersecurity (Managed Security Services). HQ: Kansas City, Missouri, United States.

The company's live postings are served by **Lever** on job board
`cyderes` (`https://jobs.lever.co/cyderes`), which exposed
**20 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-cyderes` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CYDERES`** in the source
> registry, so that a single `siteType: [Site.CYDERES]` request returns
> Cyderes's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CYDERES = 'cyderes'` to the `Site` enum. | must |
| FR-2 | `CyderesService` implements `IScraper`, `@SourcePlugin({ site: Site.CYDERES, name: 'Cyderes', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'cyderes' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CYDERES`, `companyName = 'Cyderes'`, `id` prefix `lever-`→`cyderes-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Managed detection and response (MDR) services
- Identity and access management delivery (e.g., SailPoint)
- Managed Microsoft Sentinel security engineering
- Global delivery across the US and UK
