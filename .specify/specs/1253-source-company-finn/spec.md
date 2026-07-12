# Spec: 1253 — Source Company Plugin: FINN

| Field | Value |
| --- | --- |
| Spec ID | 1253 |
| Slug | source-company-finn |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-finn` for
**FINN** (Car subscription platform offering flexible vehicle access.). Sector: logistics. HQ: Munich, Bavaria, Germany.

The company's live postings are served by **Lever** on job board
`finn` (`https://jobs.lever.co/finn`), which exposed
**42 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-finn` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FINN`** in the source
> registry, so that a single `siteType: [Site.FINN]` request returns
> FINN's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FINN = 'finn'` to the `Site` enum. | must |
| FR-2 | `FINNService` implements `IScraper`, `@SourcePlugin({ site: Site.FINN, name: 'FINN', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'finn' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FINN`, `companyName = 'FINN'`, `id` prefix `lever-`→`finn-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Car subscription platform
- All-inclusive flexible vehicle plans
- Hiring across account management and customer service
