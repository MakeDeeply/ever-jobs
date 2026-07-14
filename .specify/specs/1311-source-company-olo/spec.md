# Spec: 1311 — Source Company Plugin: Olo

| Field | Value |
| --- | --- |
| Spec ID | 1311 |
| Slug | source-company-olo |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-olo` for
**Olo** (SaaS platform for restaurant digital ordering, payments, and guest engagement.). Sector: B2B SaaS / Restaurant Technology. HQ: New York, New York, United States.

The company's live postings are served by **Lever** on job board
`olo` (`https://jobs.lever.co/olo`), which exposed
**9 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-olo` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.OLO`** in the source
> registry, so that a single `siteType: [Site.OLO]` request returns
> Olo's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.OLO = 'olo'` to the `Site` enum. | must |
| FR-2 | `OloService` implements `IScraper`, `@SourcePlugin({ site: Site.OLO, name: 'Olo', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'olo' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.OLO`, `companyName = 'Olo'`, `id` prefix `lever-`→`olo-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Publicly listed restaurant-technology SaaS provider
- Hybrid roles across NYC and remote, plus a Belfast engineering hub
- Product areas include ordering, payments, and guest engagement
