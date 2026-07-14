# Spec: 1082 — Source Company Plugin: Observable Space

| Field | Value |
| --- | --- |
| Spec ID | 1082 |
| Slug | source-company-observablespace |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-observablespace` for
**Observable Space** (Builds telescopes, lasercom ground stations, and optical sensors for space domain awareness.). Sector: Space (Optics & Domain Awareness). HQ: Los Angeles, California, USA.

The company's live postings are served by **Ashby** on job board
`observable-space` (`https://jobs.ashbyhq.com/observable-space`), which exposed
**22 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-observablespace` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.OBSERVABLE_SPACE`** in the source
> registry, so that a single `siteType: [Site.OBSERVABLE_SPACE]` request returns
> Observable Space's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.OBSERVABLE_SPACE = 'observablespace'` to the `Site` enum. | must |
| FR-2 | `ObservableSpaceService` implements `IScraper`, `@SourcePlugin({ site: Site.OBSERVABLE_SPACE, name: 'Observable Space', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'observable-space' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.OBSERVABLE_SPACE`, `companyName = 'Observable Space'`, `id` prefix `ashby-`→`observablespace-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Builds software-defined telescopes and optical sensors
- Products span lasercom ground stations and space domain awareness
- Holds a US Space Force IDIQ contract
