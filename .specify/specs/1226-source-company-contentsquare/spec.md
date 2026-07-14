# Spec: 1226 — Source Company Plugin: Contentsquare

| Field | Value |
| --- | --- |
| Spec ID | 1226 |
| Slug | source-company-contentsquare |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-contentsquare` for
**Contentsquare** (Digital experience analytics platform that measures and analyzes user behavior on websites and apps.). Sector: Digital / experience analytics. HQ: Paris, Ile-de-France, France.

The company's live postings are served by **Lever** on job board
`contentsquare` (`https://jobs.lever.co/contentsquare`), which exposed
**39 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-contentsquare` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CONTENTSQUARE`** in the source
> registry, so that a single `siteType: [Site.CONTENTSQUARE]` request returns
> Contentsquare's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CONTENTSQUARE = 'contentsquare'` to the `Site` enum. | must |
| FR-2 | `ContentsquareService` implements `IScraper`, `@SourcePlugin({ site: Site.CONTENTSQUARE, name: 'Contentsquare', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'contentsquare' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CONTENTSQUARE`, `companyName = 'Contentsquare'`, `id` prefix `lever-`→`contentsquare-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Experience-analytics platform used for web and app behavioral analysis.
- Global company with offices across multiple regions.
- Postings include solutions engineering and support engineering roles.
