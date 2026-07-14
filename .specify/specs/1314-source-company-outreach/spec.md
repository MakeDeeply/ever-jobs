# Spec: 1314 — Source Company Plugin: Outreach

| Field | Value |
| --- | --- |
| Spec ID | 1314 |
| Slug | source-company-outreach |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-outreach` for
**Outreach** (Sales execution and engagement platform for revenue teams.). Sector: B2B SaaS / Sales Engagement. HQ: Seattle, Washington, United States.

The company's live postings are served by **Lever** on job board
`outreach` (`https://jobs.lever.co/outreach`), which exposed
**34 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-outreach` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.OUTREACH`** in the source
> registry, so that a single `siteType: [Site.OUTREACH]` request returns
> Outreach's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.OUTREACH = 'outreach'` to the `Site` enum. | must |
| FR-2 | `OutreachService` implements `IScraper`, `@SourcePlugin({ site: Site.OUTREACH, name: 'Outreach', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'outreach' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.OUTREACH`, `companyName = 'Outreach'`, `id` prefix `lever-`→`outreach-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Sales engagement and revenue operations platform
- Roles in the United States and United Kingdom
- Openings across sales, revenue operations, and applied science
