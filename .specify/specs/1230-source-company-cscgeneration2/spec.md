# Spec: 1230 — Source Company Plugin: CSC Generation

| Field | Value |
| --- | --- |
| Spec ID | 1230 |
| Slug | source-company-cscgeneration2 |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-cscgeneration2` for
**CSC Generation** (Holding company that acquires and operates retail and e-commerce brands.). Sector: Retail / E-commerce. HQ: Merrillville, Indiana, USA.

The company's live postings are served by **Lever** on job board
`cscgeneration-2` (`https://jobs.lever.co/cscgeneration-2`), which exposed
**435 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-cscgeneration2` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CSC_GENERATION`** in the source
> registry, so that a single `siteType: [Site.CSC_GENERATION]` request returns
> CSC Generation's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CSC_GENERATION = 'cscgeneration2'` to the `Site` enum. | must |
| FR-2 | `CSCGenerationService` implements `IScraper`, `@SourcePlugin({ site: Site.CSC_GENERATION, name: 'CSC Generation', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'cscgeneration-2' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CSC_GENERATION`, `companyName = 'CSC Generation'`, `id` prefix `lever-`→`cscgeneration2-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Operates acquired retail brands including Sur La Table and Backcountry
- Runs distribution and fulfillment centers in the US
- Combines physical retail with e-commerce operations
