# Spec: 1342 — Source Company Plugin: Spotify

| Field | Value |
| --- | --- |
| Spec ID | 1342 |
| Slug | source-company-spotify |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-spotify` for
**Spotify** (Audio streaming company that also builds Backstage, an enterprise developer platform.). Sector: B2B SaaS / Developer Platforms & Media. HQ: Stockholm, Stockholm, Sweden.

The company's live postings are served by **Lever** on job board
`spotify` (`https://jobs.lever.co/spotify`), which exposed
**113 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-spotify` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SPOTIFY`** in the source
> registry, so that a single `siteType: [Site.SPOTIFY]` request returns
> Spotify's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SPOTIFY = 'spotify'` to the `Site` enum. | must |
| FR-2 | `SpotifyService` implements `IScraper`, `@SourcePlugin({ site: Site.SPOTIFY, name: 'Spotify', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'spotify' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SPOTIFY`, `companyName = 'Spotify'`, `id` prefix `lever-`→`spotify-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Backstage is Spotify's enterprise internal developer portal
- Roles in Stockholm, London, New York, and Asia
- Openings across analytics, advertising, finance, and engineering
