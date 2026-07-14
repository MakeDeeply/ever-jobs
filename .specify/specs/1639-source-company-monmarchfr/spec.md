# Spec: 1639 — Source Company Plugin: Mon-marché.fr

| Field | Value |
| --- | --- |
| Spec ID | 1639 |
| Slug | source-company-monmarchfr |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-monmarchfr` for **Mon-marché.fr** (E-commerce and logistics platform delivering fresh grocery products to homes.). Sector:
E-commerce / Grocery tech. HQ: Île-de-France, France.

The company's live postings are served by **Recruitee** on subdomain
`monmarchefr` (`https://monmarchefr.recruitee.com`), which exposed
**6 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-monmarchfr` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MON_MARCH_FR`** in the source
> registry, so that a single `siteType: [Site.MON_MARCH_FR]` request returns
> Mon-marché.fr's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MON_MARCH_FR = 'monmarchfr'` to the `Site` enum. | must |
| FR-2 | `MonMarchFrService` implements `IScraper`, `@SourcePlugin({ site: Site.MON_MARCH_FR, name: 'Mon-marché.fr', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'monmarchefr' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MON_MARCH_FR`, `companyName = 'Mon-marché.fr'`, `id` prefix `recruitee-`→`monmarchfr-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board: https://monmarchefr.recruitee.com/api/offers returns 7 open offers
- Focus on ultra-fresh grocery e-commerce and logistics
- Operates primarily in the Île-de-France region
