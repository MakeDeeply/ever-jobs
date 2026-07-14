# Spec: 1366 — Source Company Plugin: Waabi

| Field | Value |
| --- | --- |
| Spec ID | 1366 |
| Slug | source-company-waabi |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-waabi` for
**Waabi** (AI-first autonomous driving technology for trucking and robotaxis.). Sector: Autonomous Vehicles. HQ: Toronto, Ontario, Canada.

The company's live postings are served by **Lever** on job board
`waabi` (`https://jobs.lever.co/waabi`), which exposed
**60 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-waabi` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.WAABI`** in the source
> registry, so that a single `siteType: [Site.WAABI]` request returns
> Waabi's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.WAABI = 'waabi'` to the `Site` enum. | must |
| FR-2 | `WaabiService` implements `IScraper`, `@SourcePlugin({ site: Site.WAABI, name: 'Waabi', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'waabi' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.WAABI`, `companyName = 'Waabi'`, `id` prefix `lever-`→`waabi-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- AI-first, simulation-driven autonomy approach
- Targets autonomous trucking and robotaxis
- Hiring research scientists and applied scientists
