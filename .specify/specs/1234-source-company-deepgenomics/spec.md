# Spec: 1234 — Source Company Plugin: Deep Genomics

| Field | Value |
| --- | --- |
| Spec ID | 1234 |
| Slug | source-company-deepgenomics |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-deepgenomics` for
**Deep Genomics** (Applies AI to RNA biology for drug discovery.). Sector: Applied AI / drug discovery. HQ: Toronto, Ontario, Canada.

The company's live postings are served by **Lever** on job board
`deepgenomics` (`https://jobs.lever.co/deepgenomics`), which exposed
**4 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-deepgenomics` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DEEP_GENOMICS`** in the source
> registry, so that a single `siteType: [Site.DEEP_GENOMICS]` request returns
> Deep Genomics's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DEEP_GENOMICS = 'deepgenomics'` to the `Site` enum. | must |
| FR-2 | `DeepGenomicsService` implements `IScraper`, `@SourcePlugin({ site: Site.DEEP_GENOMICS, name: 'Deep Genomics', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'deepgenomics' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DEEP_GENOMICS`, `companyName = 'Deep Genomics'`, `id` prefix `lever-`→`deepgenomics-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Applies AI to RNA biology for drug discovery
- MLOps roles own ML pipeline, CI/CD and model deployment
- ML research and pharmacology roles
- Headquartered in Toronto with Cambridge, MA presence
