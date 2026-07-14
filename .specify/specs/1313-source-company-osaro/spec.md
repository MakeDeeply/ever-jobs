# Spec: 1313 — Source Company Plugin: OSARO

| Field | Value |
| --- | --- |
| Spec ID | 1313 |
| Slug | source-company-osaro |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-osaro` for
**OSARO** (Machine-learning software and robotics for warehouse and manufacturing automation.). Sector: Robotics. HQ: San Francisco, California, United States.

The company's live postings are served by **Lever** on job board
`osaro` (`https://jobs.lever.co/osaro`), which exposed
**9 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-osaro` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.OSARO`** in the source
> registry, so that a single `siteType: [Site.OSARO]` request returns
> OSARO's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.OSARO = 'osaro'` to the `Site` enum. | must |
| FR-2 | `OSAROService` implements `IScraper`, `@SourcePlugin({ site: Site.OSARO, name: 'OSARO', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'osaro' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.OSARO`, `companyName = 'OSARO'`, `id` prefix `lever-`→`osaro-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Machine-learning software for robotic piece-picking
- Serves e-commerce fulfillment and manufacturing
- Hiring deployment engineers and maintenance technicians
