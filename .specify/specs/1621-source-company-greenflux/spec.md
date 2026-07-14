# Spec: 1621 — Source Company Plugin: GreenFlux

| Field | Value |
| --- | --- |
| Spec ID | 1621 |
| Slug | source-company-greenflux |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-greenflux` for **GreenFlux** (Cloud SaaS platform for managing EV charging networks and smart-charging operations.). Sector:
EV-charging SaaS (retail-tech adjacent). HQ: Amsterdam, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`greenflux` (`https://greenflux.recruitee.com`), which exposed
**8 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-greenflux` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.GREENFLUX`** in the source
> registry, so that a single `siteType: [Site.GREENFLUX]` request returns
> GreenFlux's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.GREENFLUX = 'greenflux'` to the `Site` enum. | must |
| FR-2 | `GreenFluxService` implements `IScraper`, `@SourcePlugin({ site: Site.GREENFLUX, name: 'GreenFlux', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'greenflux' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.GREENFLUX`, `companyName = 'GreenFlux'`, `id` prefix `recruitee-`→`greenflux-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board with 5 live offers, all in Amsterdam.
- SaaS platform for EV-charging network operators.
- Note: mobility/energy SaaS rather than pure e-commerce retail.
