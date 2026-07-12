# Spec: 1312 — Source Company Plugin: Orb Aerospace

| Field | Value |
| --- | --- |
| Spec ID | 1312 |
| Slug | source-company-orbaerospace |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-orbaerospace` for
**Orb Aerospace** (Autonomous resilient communications and embedded robotics hardware for tactical use.). Sector: Hardware/Defense. HQ: Lowell, Michigan, United States.

The company's live postings are served by **Lever** on job board
`orbaerospace` (`https://jobs.lever.co/orbaerospace`), which exposed
**8 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-orbaerospace` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ORB_AEROSPACE`** in the source
> registry, so that a single `siteType: [Site.ORB_AEROSPACE]` request returns
> Orb Aerospace's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ORB_AEROSPACE = 'orbaerospace'` to the `Site` enum. | must |
| FR-2 | `OrbAerospaceService` implements `IScraper`, `@SourcePlugin({ site: Site.ORB_AEROSPACE, name: 'Orb Aerospace', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'orbaerospace' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ORB_AEROSPACE`, `companyName = 'Orb Aerospace'`, `id` prefix `lever-`→`orbaerospace-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Autonomous resilient communications hardware
- Embedded robotics for tactical communications
- Hiring embedded robotics and communications technicians
