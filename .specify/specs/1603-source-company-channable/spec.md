# Spec: 1603 — Source Company Plugin: Channable

| Field | Value |
| --- | --- |
| Spec ID | 1603 |
| Slug | source-company-channable |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-channable` for **Channable** (Feed-management and PPC-automation SaaS that syndicates e-commerce product data to marketplaces, comparison sites, and affiliate platforms.). Sector:
E-commerce SaaS / feed management. HQ: Utrecht, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`channable` (`https://channable.recruitee.com`), which exposed
**17 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-channable` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CHANNABLE`** in the source
> registry, so that a single `siteType: [Site.CHANNABLE]` request returns
> Channable's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CHANNABLE = 'channable'` to the `Site` enum. | must |
| FR-2 | `ChannableService` implements `IScraper`, `@SourcePlugin({ site: Site.CHANNABLE, name: 'Channable', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'channable' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CHANNABLE`, `companyName = 'Channable'`, `id` prefix `recruitee-`→`channable-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board (channable.recruitee.com/api/offers) with 3 live offers.
- Core product covers product-feed management plus PPC/ad automation for e-commerce.
- Open roles skew commercial (Account Executive / BDR) across DACH and France.
