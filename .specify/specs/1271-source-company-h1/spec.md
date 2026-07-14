# Spec: 1271 — Source Company Plugin: H1

| Field | Value |
| --- | --- |
| Spec ID | 1271 |
| Slug | source-company-h1 |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-h1` for
**H1** (Healthcare data platform connecting information on physicians, researchers, and clinical trials.). Sector: Health Tech / Data. HQ: New York, New York, USA.

The company's live postings are served by **Lever** on job board
`h1` (`https://jobs.lever.co/h1`), which exposed
**22 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-h1` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.H1`** in the source
> registry, so that a single `siteType: [Site.H1]` request returns
> H1's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.H1 = 'h1'` to the `Site` enum. | must |
| FR-2 | `H1Service` implements `IScraper`, `@SourcePlugin({ site: Site.H1, name: 'H1', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'h1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.H1`, `companyName = 'H1'`, `id` prefix `lever-`→`h1-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Global database of healthcare professionals and researchers
- Serves pharmaceutical and life-sciences customers
- Applies machine learning across the clinical-trial lifecycle
