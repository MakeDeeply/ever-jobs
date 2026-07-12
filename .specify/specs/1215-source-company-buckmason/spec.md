# Spec: 1215 — Source Company Plugin: Buck Mason

| Field | Value |
| --- | --- |
| Spec ID | 1215 |
| Slug | source-company-buckmason |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-buckmason` for
**Buck Mason** (American menswear and womenswear brand selling online and through retail stores.). Sector: Retail / Apparel e-commerce. HQ: Los Angeles, California, USA.

The company's live postings are served by **Lever** on job board
`buckmason` (`https://jobs.lever.co/buckmason`), which exposed
**252 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-buckmason` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.BUCK_MASON`** in the source
> registry, so that a single `siteType: [Site.BUCK_MASON]` request returns
> Buck Mason's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.BUCK_MASON = 'buckmason'` to the `Site` enum. | must |
| FR-2 | `BuckMasonService` implements `IScraper`, `@SourcePlugin({ site: Site.BUCK_MASON, name: 'Buck Mason', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'buckmason' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.BUCK_MASON`, `companyName = 'Buck Mason'`, `id` prefix `lever-`→`buckmason-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Designs and sells men's and women's apparel
- Operates both e-commerce and physical retail stores
- In-house merchandising, sourcing, and technical design teams
