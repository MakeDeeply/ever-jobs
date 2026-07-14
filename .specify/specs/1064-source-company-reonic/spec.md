# Spec: 1064 — Source Company Plugin: Reonic

| Field | Value |
| --- | --- |
| Spec ID | 1064 |
| Slug | source-company-reonic |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-reonic` for
**Reonic** (Provides software for solar and heat pump installers to plan and manage residential energy projects.). Sector: Solar / clean energy software. HQ: Karlsruhe, Germany.

The company's live postings are served by **Ashby** on job board
`reonic` (`https://jobs.ashbyhq.com/reonic`), which exposed
**28 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-reonic` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.REONIC`** in the source
> registry, so that a single `siteType: [Site.REONIC]` request returns
> Reonic's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.REONIC = 'reonic'` to the `Site` enum. | must |
| FR-2 | `ReonicService` implements `IScraper`, `@SourcePlugin({ site: Site.REONIC, name: 'Reonic', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'reonic' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.REONIC`, `companyName = 'Reonic'`, `id` prefix `ashby-`→`reonic-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Software for solar, battery, and heat pump installers
- Supports planning, quoting, and project management
- Targets residential clean-energy installation workflows
- Based in Germany
