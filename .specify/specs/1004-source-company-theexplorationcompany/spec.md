# Spec: 1004 — Source Company Plugin: The Exploration Company

| Field | Value |
| --- | --- |
| Spec ID | 1004 |
| Slug | source-company-theexplorationcompany |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-theexplorationcompany` for
**The Exploration Company** (Develops Nyx, a reusable in-orbit space vehicle and reentry capsule.). Sector: Space. HQ: Munich, Germany / Bordeaux, France.

The company's live postings are served by **Ashby** on job board
`the-exploration-company` (`https://jobs.ashbyhq.com/the-exploration-company`), which exposed
**104 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-theexplorationcompany` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.THE_EXPLORATION_COMPANY`** in the source
> registry, so that a single `siteType: [Site.THE_EXPLORATION_COMPANY]` request returns
> The Exploration Company's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.THE_EXPLORATION_COMPANY = 'theexplorationcompany'` to the `Site` enum. | must |
| FR-2 | `TheExplorationCompanyService` implements `IScraper`, `@SourcePlugin({ site: Site.THE_EXPLORATION_COMPANY, name: 'The Exploration Company', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'the-exploration-company' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.THE_EXPLORATION_COMPANY`, `companyName = 'The Exploration Company'`, `id` prefix `ashby-`→`theexplorationcompany-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Developing the Nyx reusable orbital vehicle
- Works on reentry capsule and thermal protection systems
- European space company with German and French sites
