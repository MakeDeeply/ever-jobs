# Spec: 1269 — Source Company Plugin: Greenlight Financial Technology

| Field | Value |
| --- | --- |
| Spec ID | 1269 |
| Slug | source-company-greenlight |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-greenlight` for
**Greenlight Financial Technology** (Family finance app providing debit cards and money-management tools for kids and teens.). Sector: Consumer Fintech. HQ: Atlanta, Georgia, United States.

The company's live postings are served by **Lever** on job board
`greenlight` (`https://jobs.lever.co/greenlight`), which exposed
**14 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-greenlight` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.GREENLIGHT_FINANCIAL_TECHNOLOGY`** in the source
> registry, so that a single `siteType: [Site.GREENLIGHT_FINANCIAL_TECHNOLOGY]` request returns
> Greenlight Financial Technology's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.GREENLIGHT_FINANCIAL_TECHNOLOGY = 'greenlight'` to the `Site` enum. | must |
| FR-2 | `GreenlightFinancialTechnologyService` implements `IScraper`, `@SourcePlugin({ site: Site.GREENLIGHT_FINANCIAL_TECHNOLOGY, name: 'Greenlight Financial Technology', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'greenlight' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.GREENLIGHT_FINANCIAL_TECHNOLOGY`, `companyName = 'Greenlight Financial Technology'`, `id` prefix `lever-`→`greenlight-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Atlanta-headquartered with an engineering center in Bengaluru, India.
- Also sells to financial institutions via a B2B program.
- Distributed workforce with remote and hybrid roles.
