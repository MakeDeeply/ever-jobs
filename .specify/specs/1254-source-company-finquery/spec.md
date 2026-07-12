# Spec: 1254 — Source Company Plugin: FinQuery

| Field | Value |
| --- | --- |
| Spec ID | 1254 |
| Slug | source-company-finquery |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-finquery` for
**FinQuery** (Accounting automation platform for lease, contract, and expense management.). Sector: B2B SaaS / Accounting & Finance. HQ: Atlanta, Georgia, United States.

The company's live postings are served by **Lever** on job board
`finquery` (`https://jobs.lever.co/finquery`), which exposed
**16 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-finquery` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FINQUERY`** in the source
> registry, so that a single `siteType: [Site.FINQUERY]` request returns
> FinQuery's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FINQUERY = 'finquery'` to the `Site` enum. | must |
| FR-2 | `FinQueryService` implements `IScraper`, `@SourcePlugin({ site: Site.FINQUERY, name: 'FinQuery', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'finquery' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FINQUERY`, `companyName = 'FinQuery'`, `id` prefix `lever-`→`finquery-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Lease accounting and contract-management automation
- Teams in the US, United Kingdom, and South Africa
- Roles across sales development, customer success, and engineering
