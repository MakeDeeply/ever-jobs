# Spec: 1088 — Source Company Plugin: Aspora

| Field | Value |
| --- | --- |
| Spec ID | 1088 |
| Slug | source-company-aspora |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-aspora` for
**Aspora** (A cross-border financial platform for the non-resident Indian diaspora.). Sector: Fintech - Remittance & cross-border banking. HQ: USA / India.

The company's live postings are served by **Ashby** on job board
`aspora` (`https://jobs.ashbyhq.com/aspora`), which exposed
**20 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-aspora` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ASPORA`** in the source
> registry, so that a single `siteType: [Site.ASPORA]` request returns
> Aspora's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ASPORA = 'aspora'` to the `Site` enum. | must |
| FR-2 | `AsporaService` implements `IScraper`, `@SourcePlugin({ site: Site.ASPORA, name: 'Aspora', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'aspora' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ASPORA`, `companyName = 'Aspora'`, `id` prefix `ashby-`→`aspora-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Cross-border money transfers and bill payments for the NRI diaspora
- Founded in 2022
- Backed by Sequoia, Greylock, Hummingbird, Y Combinator, and Global Founders Capital
