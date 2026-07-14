# Spec: 1289 — Source Company Plugin: KIPP SoCal Public Schools

| Field | Value |
| --- | --- |
| Spec ID | 1289 |
| Slug | source-company-kippsocal |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-kippsocal` for
**KIPP SoCal Public Schools** (Network of tuition-free public charter schools in Southern California.). Sector: education. HQ: Los Angeles, California, United States.

The company's live postings are served by **Lever** on job board
`kippsocal` (`https://jobs.lever.co/kippsocal`), which exposed
**19 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-kippsocal` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.KIPP_SOCAL_PUBLIC_SCHOOLS`** in the source
> registry, so that a single `siteType: [Site.KIPP_SOCAL_PUBLIC_SCHOOLS]` request returns
> KIPP SoCal Public Schools's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.KIPP_SOCAL_PUBLIC_SCHOOLS = 'kippsocal'` to the `Site` enum. | must |
| FR-2 | `KIPPSoCalPublicSchoolsService` implements `IScraper`, `@SourcePlugin({ site: Site.KIPP_SOCAL_PUBLIC_SCHOOLS, name: 'KIPP SoCal Public Schools', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'kippsocal' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.KIPP_SOCAL_PUBLIC_SCHOOLS`, `companyName = 'KIPP SoCal Public Schools'`, `id` prefix `lever-`→`kippsocal-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Network of public charter schools in Southern California
- Tuition-free, open-enrollment model
- Hiring teachers and program managers
