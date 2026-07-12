# Spec: 1015 — Source Company Plugin: Hinge Health

| Field | Value |
| --- | --- |
| Spec ID | 1015 |
| Slug | source-company-hingehealth |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-hingehealth` for
**Hinge Health** (Digital clinic for musculoskeletal (joint and muscle) care.). Sector: Digital health (musculoskeletal). HQ: San Francisco, CA, USA.

The company's live postings are served by **Ashby** on job board
`hinge-health` (`https://jobs.ashbyhq.com/hinge-health`), which exposed
**75 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-hingehealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HINGE_HEALTH`** in the source
> registry, so that a single `siteType: [Site.HINGE_HEALTH]` request returns
> Hinge Health's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HINGE_HEALTH = 'hingehealth'` to the `Site` enum. | must |
| FR-2 | `HingeHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.HINGE_HEALTH, name: 'Hinge Health', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'hinge-health' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HINGE_HEALTH`, `companyName = 'Hinge Health'`, `id` prefix `ashby-`→`hingehealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Digital musculoskeletal care with exercise therapy
- Uses motion sensors and app-based coaching
- Distributed through employers and health plans
