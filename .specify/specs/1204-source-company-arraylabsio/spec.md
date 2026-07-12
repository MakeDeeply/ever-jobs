# Spec: 1204 — Source Company Plugin: Array Labs

| Field | Value |
| --- | --- |
| Spec ID | 1204 |
| Slug | source-company-arraylabsio |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-arraylabsio` for
**Array Labs** (Radar satellite constellation for 3D imaging of Earth.). Sector: Space/Aerospace. HQ: Redwood City, California, United States.

The company's live postings are served by **Lever** on job board
`arraylabs.io` (`https://jobs.lever.co/arraylabs.io`), which exposed
**32 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-arraylabsio` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ARRAY_LABS`** in the source
> registry, so that a single `siteType: [Site.ARRAY_LABS]` request returns
> Array Labs's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ARRAY_LABS = 'arraylabsio'` to the `Site` enum. | must |
| FR-2 | `ArrayLabsService` implements `IScraper`, `@SourcePlugin({ site: Site.ARRAY_LABS, name: 'Array Labs', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'arraylabs.io' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ARRAY_LABS`, `companyName = 'Array Labs'`, `id` prefix `lever-`→`arraylabsio-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Coordinated radar satellite fleet for 3D Earth mapping
- Builds satellites, payloads, and data products in-house
- Hiring antenna, board, and reconstruction engineers
