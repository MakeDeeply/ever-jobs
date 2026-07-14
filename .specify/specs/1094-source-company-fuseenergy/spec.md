# Spec: 1094 — Source Company Plugin: Fuse Energy

| Field | Value |
| --- | --- |
| Spec ID | 1094 |
| Slug | source-company-fuseenergy |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-fuseenergy` for
**Fuse Energy** (Develops pulsed-power fusion technology and related high-energy systems.). Sector: Fusion energy. HQ: San Leandro, California, USA.

The company's live postings are served by **Ashby** on job board
`fuse` (`https://jobs.ashbyhq.com/fuse`), which exposed
**17 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-fuseenergy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FUSE_ENERGY`** in the source
> registry, so that a single `siteType: [Site.FUSE_ENERGY]` request returns
> Fuse Energy's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FUSE_ENERGY = 'fuseenergy'` to the `Site` enum. | must |
| FR-2 | `FuseEnergyService` implements `IScraper`, `@SourcePlugin({ site: Site.FUSE_ENERGY, name: 'Fuse Energy', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'fuse' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FUSE_ENERGY`, `companyName = 'Fuse Energy'`, `id` prefix `ashby-`→`fuseenergy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops pulsed-power fusion technology
- Employs laser, electrical, and computational physics teams
- Operates sites in San Leandro, California and Montreal
- Focused on advancing fusion energy
