# Spec: 1319 — Source Company Plugin: Peak

| Field | Value |
| --- | --- |
| Spec ID | 1319 |
| Slug | source-company-peakgames |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-peakgames` for
**Peak** (Mobile games company known for the titles Toon Blast and Toy Blast.). Sector: gaming. HQ: Istanbul, Istanbul, Turkey.

The company's live postings are served by **Lever** on job board
`peakgames` (`https://jobs.lever.co/peakgames`), which exposed
**20 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-peakgames` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PEAK`** in the source
> registry, so that a single `siteType: [Site.PEAK]` request returns
> Peak's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PEAK = 'peakgames'` to the `Site` enum. | must |
| FR-2 | `PeakService` implements `IScraper`, `@SourcePlugin({ site: Site.PEAK, name: 'Peak', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'peakgames' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PEAK`, `companyName = 'Peak'`, `id` prefix `lever-`→`peakgames-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Developer of Toon Blast and Toy Blast
- Focused on casual mobile puzzle games
- Hiring across art, marketing and engineering
