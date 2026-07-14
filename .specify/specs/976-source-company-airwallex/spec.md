# Spec: 976 — Source Company Plugin: Airwallex

| Field | Value |
| --- | --- |
| Spec ID | 976 |
| Slug | source-company-airwallex |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-airwallex` for
**Airwallex** (A global payments and financial platform for businesses.). Sector: Fintech - Cross-border payments. HQ: Singapore / Melbourne, Australia.

The company's live postings are served by **Ashby** on job board
`airwallex` (`https://jobs.ashbyhq.com/airwallex`), which exposed
**593 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-airwallex` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.AIRWALLEX`** in the source
> registry, so that a single `siteType: [Site.AIRWALLEX]` request returns
> Airwallex's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.AIRWALLEX = 'airwallex'` to the `Site` enum. | must |
| FR-2 | `AirwallexService` implements `IScraper`, `@SourcePlugin({ site: Site.AIRWALLEX, name: 'Airwallex', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'airwallex' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.AIRWALLEX`, `companyName = 'Airwallex'`, `id` prefix `ashby-`→`airwallex-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Cross-border payments and multi-currency accounts
- Cards and embedded finance APIs for businesses
- Operates as a global financial infrastructure provider
