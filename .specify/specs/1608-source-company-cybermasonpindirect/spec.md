# Spec: 1608 — Source Company Plugin: Cyber & Mason (PinDirect)

| Field | Value |
| --- | --- |
| Spec ID | 1608 |
| Slug | source-company-cybermasonpindirect |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-cybermasonpindirect` for **Cyber & Mason (PinDirect)** (Amersfoort payments company delivering card/terminal payment solutions for SMBs and hospitality under the PinDirect brand.). Sector:
Payments / SME acquiring. HQ: Amersfoort, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`cybermason` (`https://cybermason.recruitee.com`), which exposed
**4 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-cybermasonpindirect` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CYBER_MASON_PINDIRECT`** in the source
> registry, so that a single `siteType: [Site.CYBER_MASON_PINDIRECT]` request returns
> Cyber & Mason (PinDirect)'s live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CYBER_MASON_PINDIRECT = 'cybermasonpindirect'` to the `Site` enum. | must |
| FR-2 | `CyberMasonPinDirectService` implements `IScraper`, `@SourcePlugin({ site: Site.CYBER_MASON_PINDIRECT, name: 'Cyber & Mason (PinDirect)', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'cybermason' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CYBER_MASON_PINDIRECT`, `companyName = 'Cyber & Mason (PinDirect)'`, `id` prefix `recruitee-`→`cybermasonpindirect-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- SME and hospitality payment solutions under the PinDirect brand
- Based in Amersfoort, Utrecht province
- Recruitee board returned four live openings
