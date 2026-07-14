# Spec: 1664 — Source Company Plugin: Technica Engineering

| Field | Value |
| --- | --- |
| Spec ID | 1664 |
| Slug | source-company-technicaengineering |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-technicaengineering` for **Technica Engineering** (Automotive software and electronics for vehicle data communication.). Sector:
Automotive software / electronics. HQ: Munich, Germany.

The company's live postings are served by **Recruitee** on subdomain
`technicaengineeringgmbh` (`https://technicaengineeringgmbh.recruitee.com`), which exposed
**8 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-technicaengineering` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TECHNICA_ENGINEERING`** in the source
> registry, so that a single `siteType: [Site.TECHNICA_ENGINEERING]` request returns
> Technica Engineering's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TECHNICA_ENGINEERING = 'technicaengineering'` to the `Site` enum. | must |
| FR-2 | `TechnicaEngineeringService` implements `IScraper`, `@SourcePlugin({ site: Site.TECHNICA_ENGINEERING, name: 'Technica Engineering', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'technicaengineeringgmbh' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TECHNICA_ENGINEERING`, `companyName = 'Technica Engineering'`, `id` prefix `recruitee-`→`technicaengineering-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board at technicaengineeringgmbh.recruitee.com with 5 open offers
- Automotive Ethernet and ECU/E-E architecture focus
- In-house software and electronics products
