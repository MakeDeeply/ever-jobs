# Spec: 1026 — Source Company Plugin: Abby Care

| Field | Value |
| --- | --- |
| Spec ID | 1026 |
| Slug | source-company-abbycare |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-abbycare` for
**Abby Care** (Provides care and support for families of children with complex medical needs.). Sector: Healthtech (pediatric / home care). HQ: United States.

The company's live postings are served by **Ashby** on job board
`abby-care` (`https://jobs.ashbyhq.com/abby-care`), which exposed
**57 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-abbycare` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ABBY_CARE`** in the source
> registry, so that a single `siteType: [Site.ABBY_CARE]` request returns
> Abby Care's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ABBY_CARE = 'abbycare'` to the `Site` enum. | must |
| FR-2 | `AbbyCareService` implements `IScraper`, `@SourcePlugin({ site: Site.ABBY_CARE, name: 'Abby Care', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'abby-care' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ABBY_CARE`, `companyName = 'Abby Care'`, `id` prefix `ashby-`→`abbycare-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Serves children with complex medical needs and their caregivers
- Operates within Medicaid home-care programs
- Combines care coordination with technology
