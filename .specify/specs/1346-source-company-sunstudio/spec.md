# Spec: 1346 — Source Company Plugin: Sun Studio

| Field | Value |
| --- | --- |
| Spec ID | 1346 |
| Slug | source-company-sunstudio |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-sunstudio` for
**Sun Studio** (Mobile game studio developing casual and puzzle games.). Sector: gaming. HQ: Ho Chi Minh City, Vietnam.

The company's live postings are served by **Lever** on job board
`sunstudio` (`https://jobs.lever.co/sunstudio`), which exposed
**7 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-sunstudio` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SUN_STUDIO`** in the source
> registry, so that a single `siteType: [Site.SUN_STUDIO]` request returns
> Sun Studio's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SUN_STUDIO = 'sunstudio'` to the `Site` enum. | must |
| FR-2 | `SunStudioService` implements `IScraper`, `@SourcePlugin({ site: Site.SUN_STUDIO, name: 'Sun Studio', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'sunstudio' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SUN_STUDIO`, `companyName = 'Sun Studio'`, `id` prefix `lever-`→`sunstudio-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Ho Chi Minh City-based mobile game studio
- Focus on casual and puzzle games
- Hiring 2D artists, game designers and Unity developers
