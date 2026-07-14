# Spec: 1119 — Source Company Plugin: Method Financial

| Field | Value |
| --- | --- |
| Spec ID | 1119 |
| Slug | source-company-methodfinancial |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-methodfinancial` for
**Method Financial** (An API platform for connecting to consumer liability accounts and executing payments.). Sector: Fintech - Financial data connectivity. HQ: Austin, Texas, USA.

The company's live postings are served by **Ashby** on job board
`method` (`https://jobs.ashbyhq.com/method`), which exposed
**12 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-methodfinancial` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.METHOD_FINANCIAL`** in the source
> registry, so that a single `siteType: [Site.METHOD_FINANCIAL]` request returns
> Method Financial's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.METHOD_FINANCIAL = 'methodfinancial'` to the `Site` enum. | must |
| FR-2 | `MethodFinancialService` implements `IScraper`, `@SourcePlugin({ site: Site.METHOD_FINANCIAL, name: 'Method Financial', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'method' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.METHOD_FINANCIAL`, `companyName = 'Method Financial'`, `id` prefix `ashby-`→`methodfinancial-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Real-time liability data connectivity via API
- Instant payment execution
- Focused on consumer liability accounts
