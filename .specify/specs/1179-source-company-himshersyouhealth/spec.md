# Spec: 1179 — Source Company Plugin: Hims & Hers (You Health)

| Field | Value |
| --- | --- |
| Spec ID | 1179 |
| Slug | source-company-himshersyouhealth |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-himshersyouhealth` for
**Hims & Hers (You Health)** (Telehealth provider network serving Hims & Hers direct-to-consumer care.). Sector: Healthtech (telehealth). HQ: San Francisco, CA, USA.

The company's live postings are served by **Ashby** on job board
`you-health` (`https://jobs.ashbyhq.com/you-health`), which exposed
**5 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-himshersyouhealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HIMS_HERS_YOU_HEALTH`** in the source
> registry, so that a single `siteType: [Site.HIMS_HERS_YOU_HEALTH]` request returns
> Hims & Hers (You Health)'s live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HIMS_HERS_YOU_HEALTH = 'himshersyouhealth'` to the `Site` enum. | must |
| FR-2 | `HimsHersYouHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.HIMS_HERS_YOU_HEALTH, name: 'Hims & Hers (You Health)', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'you-health' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HIMS_HERS_YOU_HEALTH`, `companyName = 'Hims & Hers (You Health)'`, `id` prefix `ashby-`→`himshersyouhealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Telehealth provider roles for Hims & Hers
- Direct-to-consumer care across multiple categories
- Publicly traded parent company
