# Spec: 1096 — Source Company Plugin: SE3 Labs

| Field | Value |
| --- | --- |
| Spec ID | 1096 |
| Slug | source-company-se3labs |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-se3labs` for
**SE3 Labs** (Builds GPS-denied spatial-AI navigation software for autonomous drone swarms.). Sector: Defense (Spatial AI / Drones). HQ: Munich, Germany.

The company's live postings are served by **Ashby** on job board
`se3` (`https://jobs.ashbyhq.com/se3`), which exposed
**17 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-se3labs` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SE3_LABS`** in the source
> registry, so that a single `siteType: [Site.SE3_LABS]` request returns
> SE3 Labs's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SE3_LABS = 'se3labs'` to the `Site` enum. | must |
| FR-2 | `SE3LabsService` implements `IScraper`, `@SourcePlugin({ site: Site.SE3_LABS, name: 'SE3 Labs', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'se3' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SE3_LABS`, `companyName = 'SE3 Labs'`, `id` prefix `ashby-`→`se3labs-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- GPS-denied autonomous navigation for drone swarms
- Founded in 2023 out of TU Munich
- Holds contracts with the German Bundeswehr
