# Spec: 1102 — Source Company Plugin: Lead Bank

| Field | Value |
| --- | --- |
| Spec ID | 1102 |
| Slug | source-company-leadbank |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-leadbank` for
**Lead Bank** (An FDIC-insured bank building infrastructure for embedded financial products.). Sector: Fintech - Banking infrastructure. HQ: Kansas City, Missouri, USA.

The company's live postings are served by **Ashby** on job board
`leadbank` (`https://jobs.ashbyhq.com/leadbank`), which exposed
**16 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-leadbank` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LEAD_BANK`** in the source
> registry, so that a single `siteType: [Site.LEAD_BANK]` request returns
> Lead Bank's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LEAD_BANK = 'leadbank'` to the `Site` enum. | must |
| FR-2 | `LeadBankService` implements `IScraper`, `@SourcePlugin({ site: Site.LEAD_BANK, name: 'Lead Bank', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'leadbank' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LEAD_BANK`, `companyName = 'Lead Bank'`, `id` prefix `ashby-`→`leadbank-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Operates an FDIC-insured bank
- Provides banking infrastructure for embedded finance
- Serves fintech partners with banking and payments products
