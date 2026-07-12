# Spec: 978 — Source Company Plugin: Enpal

| Field | Value |
| --- | --- |
| Spec ID | 978 |
| Slug | source-company-enpal |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-enpal` for
**Enpal** (Provides subscription-based solar panels, battery storage, heat pumps, and EV charging for homes.). Sector: Solar / clean energy. HQ: Berlin, Germany.

The company's live postings are served by **Ashby** on job board
`enpal` (`https://jobs.ashbyhq.com/enpal`), which exposed
**354 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-enpal` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ENPAL`** in the source
> registry, so that a single `siteType: [Site.ENPAL]` request returns
> Enpal's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ENPAL = 'enpal'` to the `Site` enum. | must |
| FR-2 | `EnpalService` implements `IScraper`, `@SourcePlugin({ site: Site.ENPAL, name: 'Enpal', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'enpal' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ENPAL`, `companyName = 'Enpal'`, `id` prefix `ashby-`→`enpal-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Offers residential solar, batteries, heat pumps, and EV charging
- Uses subscription and leasing models for home energy hardware
- Operates a virtual power plant aggregating home energy assets
- Headquartered in Berlin, Germany
