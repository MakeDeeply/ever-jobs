# Spec: 1199 — Source Company Plugin: Analytic Partners

| Field | Value |
| --- | --- |
| Spec ID | 1199 |
| Slug | source-company-analyticpartners |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-analyticpartners` for
**Analytic Partners** (Marketing analytics and measurement firm providing commercial and marketing-mix analytics.). Sector: Marketing analytics. HQ: Miami, Florida, United States.

The company's live postings are served by **Lever** on job board
`analyticpartners` (`https://jobs.lever.co/analyticpartners`), which exposed
**14 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-analyticpartners` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ANALYTIC_PARTNERS`** in the source
> registry, so that a single `siteType: [Site.ANALYTIC_PARTNERS]` request returns
> Analytic Partners's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ANALYTIC_PARTNERS = 'analyticpartners'` to the `Site` enum. | must |
| FR-2 | `AnalyticPartnersService` implements `IScraper`, `@SourcePlugin({ site: Site.ANALYTIC_PARTNERS, name: 'Analytic Partners', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'analyticpartners' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ANALYTIC_PARTNERS`, `companyName = 'Analytic Partners'`, `id` prefix `lever-`→`analyticpartners-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Specializes in marketing science and commercial measurement analytics.
- Global analytics firm with US and international offices.
- Hiring marketing-science analytics consultants across multiple US locations.
