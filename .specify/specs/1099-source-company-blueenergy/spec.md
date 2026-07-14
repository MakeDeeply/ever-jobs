# Spec: 1099 — Source Company Plugin: Blue Energy

| Field | Value |
| --- | --- |
| Spec ID | 1099 |
| Slug | source-company-blueenergy |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-blueenergy` for
**Blue Energy** (Develops nuclear power projects using shipyard-style manufacturing to deploy new capacity faster.). Sector: Nuclear energy. HQ: USA.

The company's live postings are served by **Ashby** on job board
`blue-energy` (`https://jobs.ashbyhq.com/blue-energy`), which exposed
**16 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-blueenergy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.BLUE_ENERGY`** in the source
> registry, so that a single `siteType: [Site.BLUE_ENERGY]` request returns
> Blue Energy's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.BLUE_ENERGY = 'blueenergy'` to the `Site` enum. | must |
| FR-2 | `BlueEnergyService` implements `IScraper`, `@SourcePlugin({ site: Site.BLUE_ENERGY, name: 'Blue Energy', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'blue-energy' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.BLUE_ENERGY`, `companyName = 'Blue Energy'`, `id` prefix `ashby-`→`blueenergy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Focused on deploying new nuclear generation capacity
- Aims to reduce cost and timeline of nuclear buildout
- Emphasizes manufacturing-based deployment methods
- Mission centered on energy abundance and decarbonization
