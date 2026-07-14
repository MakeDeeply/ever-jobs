# Spec: 1079 — Source Company Plugin: Vertical Aerospace

| Field | Value |
| --- | --- |
| Spec ID | 1079 |
| Slug | source-company-verticalaerospace |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-verticalaerospace` for
**Vertical Aerospace** (Develops the VX4 electric vertical takeoff and landing (eVTOL) aircraft.). Sector: Aerospace (eVTOL). HQ: Bristol, United Kingdom.

The company's live postings are served by **Ashby** on job board
`vertical-aerospace` (`https://jobs.ashbyhq.com/vertical-aerospace`), which exposed
**23 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-verticalaerospace` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.VERTICAL_AEROSPACE`** in the source
> registry, so that a single `siteType: [Site.VERTICAL_AEROSPACE]` request returns
> Vertical Aerospace's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.VERTICAL_AEROSPACE = 'verticalaerospace'` to the `Site` enum. | must |
| FR-2 | `VerticalAerospaceService` implements `IScraper`, `@SourcePlugin({ site: Site.VERTICAL_AEROSPACE, name: 'Vertical Aerospace', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'vertical-aerospace' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.VERTICAL_AEROSPACE`, `companyName = 'Vertical Aerospace'`, `id` prefix `ashby-`→`verticalaerospace-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Developing the VX4 eVTOL aircraft
- Based in Bristol, United Kingdom
- Work spans systems safety and digital manufacturing
