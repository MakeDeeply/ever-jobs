# Spec: 1277 — Source Company Plugin: High Tech High

| Field | Value |
| --- | --- |
| Spec ID | 1277 |
| Slug | source-company-hightechhigh |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-hightechhigh` for
**High Tech High** (Network of public charter schools in San Diego County.). Sector: education. HQ: San Diego, California, United States.

The company's live postings are served by **Lever** on job board
`hightechhigh` (`https://jobs.lever.co/hightechhigh`), which exposed
**109 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-hightechhigh` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HIGH_TECH_HIGH`** in the source
> registry, so that a single `siteType: [Site.HIGH_TECH_HIGH]` request returns
> High Tech High's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HIGH_TECH_HIGH = 'hightechhigh'` to the `Site` enum. | must |
| FR-2 | `HighTechHighService` implements `IScraper`, `@SourcePlugin({ site: Site.HIGH_TECH_HIGH, name: 'High Tech High', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'hightechhigh' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HIGH_TECH_HIGH`, `companyName = 'High Tech High'`, `id` prefix `lever-`→`hightechhigh-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- K-12 public charter school network in San Diego County
- Project-based learning approach
- Hiring teachers across elementary and secondary grades
