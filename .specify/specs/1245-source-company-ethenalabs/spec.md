# Spec: 1245 — Source Company Plugin: Ethena Labs

| Field | Value |
| --- | --- |
| Spec ID | 1245 |
| Slug | source-company-ethenalabs |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-ethenalabs` for
**Ethena Labs** (DeFi protocol building the USDe synthetic dollar and stablecoin infrastructure.). Sector: DeFi / Stablecoins. HQ: Remote, Global.

The company's live postings are served by **Lever** on job board
`ethenalabs` (`https://jobs.lever.co/ethenalabs`), which exposed
**3 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-ethenalabs` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ETHENA_LABS`** in the source
> registry, so that a single `siteType: [Site.ETHENA_LABS]` request returns
> Ethena Labs's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ETHENA_LABS = 'ethenalabs'` to the `Site` enum. | must |
| FR-2 | `EthenaLabsService` implements `IScraper`, `@SourcePlugin({ site: Site.ETHENA_LABS, name: 'Ethena Labs', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ethenalabs' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ETHENA_LABS`, `companyName = 'Ethena Labs'`, `id` prefix `lever-`→`ethenalabs-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Builds the USDe synthetic dollar and USDtb fiat-backed stablecoin.
- Offers whitelabel stablecoin backend infrastructure.
- Lever postings include DeFi security engineering roles.
