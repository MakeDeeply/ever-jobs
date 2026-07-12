# Spec: 1281 — Source Company Plugin: Institute of Foundation Models

| Field | Value |
| --- | --- |
| Spec ID | 1281 |
| Slug | source-company-ifmus |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-ifmus` for
**Institute of Foundation Models** (Research institute developing large language and world foundation models.). Sector: AI / foundation model research. HQ: Sunnyvale, California, USA.

The company's live postings are served by **Lever** on job board
`ifm-us` (`https://jobs.lever.co/ifm-us`), which exposed
**43 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-ifmus` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.INSTITUTE_OF_FOUNDATION_MODELS`** in the source
> registry, so that a single `siteType: [Site.INSTITUTE_OF_FOUNDATION_MODELS]` request returns
> Institute of Foundation Models's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.INSTITUTE_OF_FOUNDATION_MODELS = 'ifmus'` to the `Site` enum. | must |
| FR-2 | `InstituteOfFoundationModelsService` implements `IScraper`, `@SourcePlugin({ site: Site.INSTITUTE_OF_FOUNDATION_MODELS, name: 'Institute of Foundation Models', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ifm-us' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.INSTITUTE_OF_FOUNDATION_MODELS`, `companyName = 'Institute of Foundation Models'`, `id` prefix `lever-`→`ifmus-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Researches large language models and world models
- AI research internship roles in LLM and world models
- Locations in Sunnyvale, CA and Abu Dhabi
- Research-institute structure
