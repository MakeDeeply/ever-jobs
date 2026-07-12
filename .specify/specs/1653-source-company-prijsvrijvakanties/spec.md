# Spec: 1653 — Source Company Plugin: Prijsvrij Vakanties

| Field | Value |
| --- | --- |
| Spec ID | 1653 |
| Slug | source-company-prijsvrijvakanties |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-prijsvrijvakanties` for **Prijsvrij Vakanties** (Online travel retailer selling package holidays, described as one of the largest travel organisations in the Netherlands.). Sector:
Online travel e-commerce. HQ: 's-Hertogenbosch, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`prijsvrijvakanties` (`https://prijsvrijvakanties.recruitee.com`), which exposed
**25 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-prijsvrijvakanties` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PRIJSVRIJ_VAKANTIES`** in the source
> registry, so that a single `siteType: [Site.PRIJSVRIJ_VAKANTIES]` request returns
> Prijsvrij Vakanties's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PRIJSVRIJ_VAKANTIES = 'prijsvrijvakanties'` to the `Site` enum. | must |
| FR-2 | `PrijsvrijVakantiesService` implements `IScraper`, `@SourcePlugin({ site: Site.PRIJSVRIJ_VAKANTIES, name: 'Prijsvrij Vakanties', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'prijsvrijvakanties' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PRIJSVRIJ_VAKANTIES`, `companyName = 'Prijsvrij Vakanties'`, `id` prefix `recruitee-`→`prijsvrijvakanties-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board with 10 live offers.
- Online package-holiday retailer undergoing a stated tech transformation.
- Roles across Marketing, IT/Tech and Product & Supply in 's-Hertogenbosch.
