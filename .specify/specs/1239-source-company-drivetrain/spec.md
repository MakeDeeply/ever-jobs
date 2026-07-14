# Spec: 1239 — Source Company Plugin: Drivetrain

| Field | Value |
| --- | --- |
| Spec ID | 1239 |
| Slug | source-company-drivetrain |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-drivetrain` for
**Drivetrain** (Cloud financial-planning-and-analysis (FP&A) SaaS platform for business decision-making.). Sector: Cloud SaaS platform. HQ: San Francisco Bay Area, California, United States.

The company's live postings are served by **Lever** on job board
`drivetrain` (`https://jobs.lever.co/drivetrain`), which exposed
**30 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-drivetrain` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DRIVETRAIN`** in the source
> registry, so that a single `siteType: [Site.DRIVETRAIN]` request returns
> Drivetrain's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DRIVETRAIN = 'drivetrain'` to the `Site` enum. | must |
| FR-2 | `DrivetrainService` implements `IScraper`, `@SourcePlugin({ site: Site.DRIVETRAIN, name: 'Drivetrain', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'drivetrain' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DRIVETRAIN`, `companyName = 'Drivetrain'`, `id` prefix `lever-`→`drivetrain-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Cloud FP&A SaaS platform integrating business data sources
- Backend and SRE roles operating multi-cloud infrastructure
- Team split across the SF Bay Area and India
