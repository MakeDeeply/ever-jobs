# Spec: 1596 — Source Company Plugin: Azumuta

| Field | Value |
| --- | --- |
| Spec ID | 1596 |
| Slug | source-company-azumuta |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-azumuta` for **Azumuta** (Manufacturing SaaS for digital work instructions, quality, and shop-floor operations.). Sector:
Software / Manufacturing SaaS. HQ: Ghent, Belgium.

The company's live postings are served by **Recruitee** on subdomain
`azumuta` (`https://azumuta.recruitee.com`), which exposed
**12 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-azumuta` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.AZUMUTA`** in the source
> registry, so that a single `siteType: [Site.AZUMUTA]` request returns
> Azumuta's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.AZUMUTA = 'azumuta'` to the `Site` enum. | must |
| FR-2 | `AzumutaService` implements `IScraper`, `@SourcePlugin({ site: Site.AZUMUTA, name: 'Azumuta', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'azumuta' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.AZUMUTA`, `companyName = 'Azumuta'`, `id` prefix `recruitee-`→`azumuta-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Recruitee board verified with 6 active offers
- Product engineering (including AI) roles based in Gent
- Manufacturing shop-floor SaaS
