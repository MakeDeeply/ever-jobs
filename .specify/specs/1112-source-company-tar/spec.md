# Spec: 1112 — Source Company Plugin: TAR

| Field | Value |
| --- | --- |
| Spec ID | 1112 |
| Slug | source-company-tar |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-tar` for
**TAR** (Builds behind-the-meter renewable power systems to supply off-grid electricity to data centers.). Sector: Off-grid renewable power. HQ: Texas, USA.

The company's live postings are served by **Ashby** on job board
`tar` (`https://jobs.ashbyhq.com/tar`), which exposed
**13 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-tar` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TAR`** in the source
> registry, so that a single `siteType: [Site.TAR]` request returns
> TAR's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TAR = 'tar'` to the `Site` enum. | must |
| FR-2 | `TARService` implements `IScraper`, `@SourcePlugin({ site: Site.TAR, name: 'TAR', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'tar' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TAR`, `companyName = 'TAR'`, `id` prefix `ashby-`→`tar-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Builds behind-the-meter microgrids with solar and battery storage
- Targets off-grid power supply for data centers
- Deploys modular, islanded power systems in West Texas
- Manufactures, deploys, and operates its own energy assets
