# Spec: 1299 — Source Company Plugin: Mainspring Energy

| Field | Value |
| --- | --- |
| Spec ID | 1299 |
| Slug | source-company-mainspringenergy |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-mainspringenergy` for
**Mainspring Energy** (Builds fuel-flexible linear generators that convert multiple fuels into local, dispatchable electricity.). Sector: Clean energy / Power generation. HQ: Menlo Park, California, USA.

The company's live postings are served by **Lever** on job board
`mainspringenergy` (`https://jobs.lever.co/mainspringenergy`), which exposed
**66 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-mainspringenergy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MAINSPRING_ENERGY`** in the source
> registry, so that a single `siteType: [Site.MAINSPRING_ENERGY]` request returns
> Mainspring Energy's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MAINSPRING_ENERGY = 'mainspringenergy'` to the `Site` enum. | must |
| FR-2 | `MainspringEnergyService` implements `IScraper`, `@SourcePlugin({ site: Site.MAINSPRING_ENERGY, name: 'Mainspring Energy', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'mainspringenergy' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MAINSPRING_ENERGY`, `companyName = 'Mainspring Energy'`, `id` prefix `lever-`→`mainspringenergy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Fuel-flexible linear generator for onsite power
- Ramps up and down to meet demand
- Manufacturing and engineering roles in Menlo Park
