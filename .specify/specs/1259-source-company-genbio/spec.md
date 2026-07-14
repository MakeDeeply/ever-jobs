# Spec: 1259 — Source Company Plugin: GenBio AI

| Field | Value |
| --- | --- |
| Spec ID | 1259 |
| Slug | source-company-genbio |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-genbio` for
**GenBio AI** (Builds pan-modal large biological models for biomedicine.). Sector: AI / biological foundation models. HQ: Palo Alto, California, USA.

The company's live postings are served by **Lever** on job board
`genbio` (`https://jobs.lever.co/genbio`), which exposed
**6 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-genbio` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.GENBIO_AI`** in the source
> registry, so that a single `siteType: [Site.GENBIO_AI]` request returns
> GenBio AI's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.GENBIO_AI = 'genbio'` to the `Site` enum. | must |
| FR-2 | `GenBioAIService` implements `IScraper`, `@SourcePlugin({ site: Site.GENBIO_AI, name: 'GenBio AI', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'genbio' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.GENBIO_AI`, `companyName = 'GenBio AI'`, `id` prefix `lever-`→`genbio-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops pan-modal Large Biological Models
- Bioinformatics data engineering and research roles
- Locations in Palo Alto and Abu Dhabi
- Focused on biomedicine applications
