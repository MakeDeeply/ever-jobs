# Spec: 1027 — Source Company Plugin: Lendable

| Field | Value |
| --- | --- |
| Spec ID | 1027 |
| Slug | source-company-lendable |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-lendable` for
**Lendable** (A technology-driven lending platform using AI to automate credit decisions.). Sector: Fintech - Lending. HQ: London, UK.

The company's live postings are served by **Ashby** on job board
`lendable` (`https://jobs.ashbyhq.com/lendable`), which exposed
**57 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-lendable` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LENDABLE`** in the source
> registry, so that a single `siteType: [Site.LENDABLE]` request returns
> Lendable's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LENDABLE = 'lendable'` to the `Site` enum. | must |
| FR-2 | `LendableService` implements `IScraper`, `@SourcePlugin({ site: Site.LENDABLE, name: 'Lendable', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'lendable' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LENDABLE`, `companyName = 'Lendable'`, `id` prefix `ashby-`→`lendable-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- AI-driven automated credit decisioning
- Originates and services loans backed by institutional investors
- Consumer lending and fintech debt finance
