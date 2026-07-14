# Spec: 1173 — Source Company Plugin: NewOrbit Space

| Field | Value |
| --- | --- |
| Spec ID | 1173 |
| Slug | source-company-neworbitspace |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-neworbitspace` for
**NewOrbit Space** (Develops spacecraft and flight software for space missions.). Sector: Space. HQ: Reading, United Kingdom.

The company's live postings are served by **Ashby** on job board
`neworbit` (`https://jobs.ashbyhq.com/neworbit`), which exposed
**5 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-neworbitspace` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NEWORBIT_SPACE`** in the source
> registry, so that a single `siteType: [Site.NEWORBIT_SPACE]` request returns
> NewOrbit Space's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NEWORBIT_SPACE = 'neworbitspace'` to the `Site` enum. | must |
| FR-2 | `NewOrbitSpaceService` implements `IScraper`, `@SourcePlugin({ site: Site.NEWORBIT_SPACE, name: 'NewOrbit Space', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'neworbit' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NEWORBIT_SPACE`, `companyName = 'NewOrbit Space'`, `id` prefix `ashby-`→`neworbitspace-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops spacecraft and flight software
- Based in the Reading area, United Kingdom
- Engineering organized around spacecraft and flight software
