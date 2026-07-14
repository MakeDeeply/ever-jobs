# Spec: 1203 — Source Company Plugin: Arc'teryx

| Field | Value |
| --- | --- |
| Spec ID | 1203 |
| Slug | source-company-arcteryxcom |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-arcteryxcom` for
**Arc'teryx** (Outdoor apparel and equipment brand selling gear online and in retail stores.). Sector: Retail / Outdoor e-commerce. HQ: North Vancouver, British Columbia, Canada.

The company's live postings are served by **Lever** on job board
`arcteryx.com` (`https://jobs.lever.co/arcteryx.com`), which exposed
**227 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-arcteryxcom` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ARC_TERYX`** in the source
> registry, so that a single `siteType: [Site.ARC_TERYX]` request returns
> Arc'teryx's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ARC_TERYX = 'arcteryxcom'` to the `Site` enum. | must |
| FR-2 | `ArcTeryxService` implements `IScraper`, `@SourcePlugin({ site: Site.ARC_TERYX, name: 'Arc'teryx', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'arcteryx.com' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ARC_TERYX`, `companyName = 'Arc'teryx'`, `id` prefix `lever-`→`arcteryxcom-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Designs technical outdoor apparel and equipment
- Operates retail stores, outlets, and e-commerce
- Product creation and development based in North Vancouver
