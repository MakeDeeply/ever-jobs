# Spec: 1022 — Source Company Plugin: Northwood Space

| Field | Value |
| --- | --- |
| Spec ID | 1022 |
| Slug | source-company-northwoodspace |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-northwoodspace` for
**Northwood Space** (Builds software-defined phased-array antennas for satellite ground stations.). Sector: Space (Ground Infrastructure). HQ: Torrance, California, USA.

The company's live postings are served by **Ashby** on job board
`northwoodspace` (`https://jobs.ashbyhq.com/northwoodspace`), which exposed
**64 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-northwoodspace` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NORTHWOOD_SPACE`** in the source
> registry, so that a single `siteType: [Site.NORTHWOOD_SPACE]` request returns
> Northwood Space's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NORTHWOOD_SPACE = 'northwoodspace'` to the `Site` enum. | must |
| FR-2 | `NorthwoodSpaceService` implements `IScraper`, `@SourcePlugin({ site: Site.NORTHWOOD_SPACE, name: 'Northwood Space', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'northwoodspace' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NORTHWOOD_SPACE`, `companyName = 'Northwood Space'`, `id` prefix `ashby-`→`northwoodspace-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops software-defined phased-array ground antennas
- Portal system communicates with multiple satellites simultaneously
- Demonstrated bidirectional links with orbiting satellites
