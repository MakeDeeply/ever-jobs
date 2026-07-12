# Spec: 1214 — Source Company Plugin: Brooks Running

| Field | Value |
| --- | --- |
| Spec ID | 1214 |
| Slug | source-company-brooksrunning |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-brooksrunning` for
**Brooks Running** (Running footwear and apparel brand selling through retail and e-commerce.). Sector: Retail / Apparel e-commerce. HQ: Seattle, Washington, USA.

The company's live postings are served by **Lever** on job board
`brooksrunning` (`https://jobs.lever.co/brooksrunning`), which exposed
**55 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-brooksrunning` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.BROOKS_RUNNING`** in the source
> registry, so that a single `siteType: [Site.BROOKS_RUNNING]` request returns
> Brooks Running's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.BROOKS_RUNNING = 'brooksrunning'` to the `Site` enum. | must |
| FR-2 | `BrooksRunningService` implements `IScraper`, `@SourcePlugin({ site: Site.BROOKS_RUNNING, name: 'Brooks Running', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'brooksrunning' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.BROOKS_RUNNING`, `companyName = 'Brooks Running'`, `id` prefix `lever-`→`brooksrunning-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Specializes in running footwear and apparel
- International operations across the US, China, and Europe
- In-house apparel design and distribution teams
