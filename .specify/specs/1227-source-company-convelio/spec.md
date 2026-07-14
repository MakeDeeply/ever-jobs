# Spec: 1227 — Source Company Plugin: Convelio

| Field | Value |
| --- | --- |
| Spec ID | 1227 |
| Slug | source-company-convelio |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-convelio` for
**Convelio** (Freight forwarding platform specializing in shipping high-value and fine art goods.). Sector: logistics. HQ: Paris, Île-de-France, France.

The company's live postings are served by **Lever** on job board
`convelio` (`https://jobs.lever.co/convelio`), which exposed
**11 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-convelio` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CONVELIO`** in the source
> registry, so that a single `siteType: [Site.CONVELIO]` request returns
> Convelio's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CONVELIO = 'convelio'` to the `Site` enum. | must |
| FR-2 | `ConvelioService` implements `IScraper`, `@SourcePlugin({ site: Site.CONVELIO, name: 'Convelio', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'convelio' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CONVELIO`, `companyName = 'Convelio'`, `id` prefix `lever-`→`convelio-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Freight forwarding for fine art and high-value goods
- Combines logistics operations with technology
- Hiring logistics managers and freight coordinators
