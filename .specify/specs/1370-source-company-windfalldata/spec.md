# Spec: 1370 — Source Company Plugin: Windfall

| Field | Value |
| --- | --- |
| Spec ID | 1370 |
| Slug | source-company-windfalldata |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-windfalldata` for
**Windfall** (People-intelligence data company providing consumer and wealth insights as a data product.). Sector: Data intelligence / data provider. HQ: San Francisco, California, United States.

The company's live postings are served by **Lever** on job board
`windfalldata` (`https://jobs.lever.co/windfalldata`), which exposed
**14 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-windfalldata` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.WINDFALL`** in the source
> registry, so that a single `siteType: [Site.WINDFALL]` request returns
> Windfall's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.WINDFALL = 'windfalldata'` to the `Site` enum. | must |
| FR-2 | `WindfallService` implements `IScraper`, `@SourcePlugin({ site: Site.WINDFALL, name: 'Windfall', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'windfalldata' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.WINDFALL`, `companyName = 'Windfall'`, `id` prefix `lever-`→`windfalldata-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Data is the company's product, spanning consumer and wealth insights.
- San Francisco-based data intelligence provider.
- Hiring across data, go-to-market, and customer-success roles.
