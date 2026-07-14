# Spec: 1143 — Source Company Plugin: Highbeam

| Field | Value |
| --- | --- |
| Spec ID | 1143 |
| Slug | source-company-highbeam |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-highbeam` for
**Highbeam** (A banking and finance platform for ecommerce and consumer brands.). Sector: Fintech - Business banking. HQ: New York, New York, USA.

The company's live postings are served by **Ashby** on job board
`highbeam` (`https://jobs.ashbyhq.com/highbeam`), which exposed
**8 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-highbeam` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HIGHBEAM`** in the source
> registry, so that a single `siteType: [Site.HIGHBEAM]` request returns
> Highbeam's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HIGHBEAM = 'highbeam'` to the `Site` enum. | must |
| FR-2 | `HighbeamService` implements `IScraper`, `@SourcePlugin({ site: Site.HIGHBEAM, name: 'Highbeam', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'highbeam' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HIGHBEAM`, `companyName = 'Highbeam'`, `id` prefix `ashby-`→`highbeam-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Banking and credit built for ecommerce brands
- Founded in 2021
- Offers embedded accounts, charge cards, and cash-flow tools
