# Spec: 1292 — Source Company Plugin: Larian Studios

| Field | Value |
| --- | --- |
| Spec ID | 1292 |
| Slug | source-company-larian |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-larian` for
**Larian Studios** (Independent video game developer known for the Divinity and Baldur's Gate role-playing game series.). Sector: gaming. HQ: Ghent, East Flanders, Belgium.

The company's live postings are served by **Lever** on job board
`larian` (`https://jobs.lever.co/larian`), which exposed
**74 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-larian` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LARIAN_STUDIOS`** in the source
> registry, so that a single `siteType: [Site.LARIAN_STUDIOS]` request returns
> Larian Studios's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LARIAN_STUDIOS = 'larian'` to the `Site` enum. | must |
| FR-2 | `LarianStudiosService` implements `IScraper`, `@SourcePlugin({ site: Site.LARIAN_STUDIOS, name: 'Larian Studios', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'larian' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LARIAN_STUDIOS`, `companyName = 'Larian Studios'`, `id` prefix `lever-`→`larian-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Developer of Baldur's Gate 3 and the Divinity: Original Sin series
- Multi-studio operation with locations in Europe and beyond
- Hiring across engineering, art, design, QA and technology teams
