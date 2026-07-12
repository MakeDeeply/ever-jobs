# Spec: 1048 — Source Company Plugin: Munich Electrification

| Field | Value |
| --- | --- |
| Spec ID | 1048 |
| Slug | source-company-munichelectrification |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-munichelectrification` for
**Munich Electrification** (Develops battery management systems and power electronics for electric vehicles and energy storage.). Sector: Battery / power electronics. HQ: Munich, Germany.

The company's live postings are served by **Ashby** on job board
`munich-electrification` (`https://jobs.ashbyhq.com/munich-electrification`), which exposed
**37 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-munichelectrification` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MUNICH_ELECTRIFICATION`** in the source
> registry, so that a single `siteType: [Site.MUNICH_ELECTRIFICATION]` request returns
> Munich Electrification's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MUNICH_ELECTRIFICATION = 'munichelectrification'` to the `Site` enum. | must |
| FR-2 | `MunichElectrificationService` implements `IScraper`, `@SourcePlugin({ site: Site.MUNICH_ELECTRIFICATION, name: 'Munich Electrification', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'munich-electrification' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MUNICH_ELECTRIFICATION`, `companyName = 'Munich Electrification'`, `id` prefix `ashby-`→`munichelectrification-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops battery management systems and power electronics
- Serves automotive and energy storage applications
- Supports electrification of transport and stationary storage
- Headquartered near Munich, Germany
