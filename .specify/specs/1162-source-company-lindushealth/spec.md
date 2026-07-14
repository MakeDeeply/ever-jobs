# Spec: 1162 — Source Company Plugin: Lindus Health

| Field | Value |
| --- | --- |
| Spec ID | 1162 |
| Slug | source-company-lindushealth |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-lindushealth` for
**Lindus Health** (Contract research organization running end-to-end clinical trials.). Sector: Biotech / healthtech (clinical trials). HQ: London, England, UK.

The company's live postings are served by **Ashby** on job board
`lindus` (`https://jobs.ashbyhq.com/lindus`), which exposed
**6 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-lindushealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LINDUS_HEALTH`** in the source
> registry, so that a single `siteType: [Site.LINDUS_HEALTH]` request returns
> Lindus Health's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LINDUS_HEALTH = 'lindushealth'` to the `Site` enum. | must |
| FR-2 | `LindusHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.LINDUS_HEALTH, name: 'Lindus Health', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'lindus' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LINDUS_HEALTH`, `companyName = 'Lindus Health'`, `id` prefix `ashby-`→`lindushealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Anti-CRO / full-service clinical trial provider
- Proprietary trial technology platform
- Serves biotech and pharma sponsors
