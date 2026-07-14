# Spec: 1611 — Source Company Plugin: Distribusion Technologies

| Field | Value |
| --- | --- |
| Spec ID | 1611 |
| Slug | source-company-distribusiontechnologies |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-distribusiontechnologies` for **Distribusion Technologies** (B2B technology marketplace connecting ground-transport operators with online retailers.). Sector:
Mobility / travel-tech platform. HQ: Berlin, Germany.

The company's live postings are served by **Recruitee** on subdomain
`distribusion` (`https://distribusion.recruitee.com`), which exposed
**34 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-distribusiontechnologies` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DISTRIBUSION_TECHNOLOGIES`** in the source
> registry, so that a single `siteType: [Site.DISTRIBUSION_TECHNOLOGIES]` request returns
> Distribusion Technologies's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DISTRIBUSION_TECHNOLOGIES = 'distribusiontechnologies'` to the `Site` enum. | must |
| FR-2 | `DistribusionTechnologiesService` implements `IScraper`, `@SourcePlugin({ site: Site.DISTRIBUSION_TECHNOLOGIES, name: 'Distribusion Technologies', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'distribusion' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DISTRIBUSION_TECHNOLOGIES`, `companyName = 'Distribusion Technologies'`, `id` prefix `recruitee-`→`distribusiontechnologies-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board at distribusion.recruitee.com with 4 open offers
- Connects ground-transport operators with retailers including Google Maps and Booking.com
- Python and backend engineering roles
