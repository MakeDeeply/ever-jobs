# Spec: 1353 — Source Company Plugin: Traackr

| Field | Value |
| --- | --- |
| Spec ID | 1353 |
| Slug | source-company-traackr |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-traackr` for
**Traackr** (Data-driven influencer marketing analytics platform.). Sector: Marketing analytics. HQ: San Francisco, California, United States.

The company's live postings are served by **Lever** on job board
`traackr` (`https://jobs.lever.co/traackr`), which exposed
**5 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-traackr` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TRAACKR`** in the source
> registry, so that a single `siteType: [Site.TRAACKR]` request returns
> Traackr's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TRAACKR = 'traackr'` to the `Site` enum. | must |
| FR-2 | `TraackrService` implements `IScraper`, `@SourcePlugin({ site: Site.TRAACKR, name: 'Traackr', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'traackr' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TRAACKR`, `companyName = 'Traackr'`, `id` prefix `lever-`→`traackr-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- SaaS platform centered on influencer marketing data and analytics.
- Global SaaS company serving brand marketing teams.
- Postings include data science and finance roles.
