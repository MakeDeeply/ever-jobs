# Spec: 1238 — Source Company Plugin: Dream Games

| Field | Value |
| --- | --- |
| Spec ID | 1238 |
| Slug | source-company-dreamgames |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-dreamgames` for
**Dream Games** (Mobile game developer behind the puzzle title Royal Match.). Sector: gaming. HQ: Istanbul, Istanbul, Turkey.

The company's live postings are served by **Lever** on job board
`dreamgames` (`https://jobs.lever.co/dreamgames`), which exposed
**17 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-dreamgames` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DREAM_GAMES`** in the source
> registry, so that a single `siteType: [Site.DREAM_GAMES]` request returns
> Dream Games's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DREAM_GAMES = 'dreamgames'` to the `Site` enum. | must |
| FR-2 | `DreamGamesService` implements `IScraper`, `@SourcePlugin({ site: Site.DREAM_GAMES, name: 'Dream Games', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'dreamgames' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DREAM_GAMES`, `companyName = 'Dream Games'`, `id` prefix `lever-`→`dreamgames-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Developer of the mobile puzzle game Royal Match
- Focused on casual mobile gaming
- Hiring across art, engineering and operations
