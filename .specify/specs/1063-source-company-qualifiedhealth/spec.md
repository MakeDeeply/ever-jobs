# Spec: 1063 — Source Company Plugin: Qualified Health

| Field | Value |
| --- | --- |
| Spec ID | 1063 |
| Slug | source-company-qualifiedhealth |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-qualifiedhealth` for
**Qualified Health** (Builds a governed generative AI platform for healthcare organizations.). Sector: Healthtech (healthcare AI). HQ: United States.

The company's live postings are served by **Ashby** on job board
`qualified-health-pbc` (`https://jobs.ashbyhq.com/qualified-health-pbc`), which exposed
**28 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-qualifiedhealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.QUALIFIED_HEALTH`** in the source
> registry, so that a single `siteType: [Site.QUALIFIED_HEALTH]` request returns
> Qualified Health's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.QUALIFIED_HEALTH = 'qualifiedhealth'` to the `Site` enum. | must |
| FR-2 | `QualifiedHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.QUALIFIED_HEALTH, name: 'Qualified Health', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'qualified-health-pbc' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.QUALIFIED_HEALTH`, `companyName = 'Qualified Health'`, `id` prefix `ashby-`→`qualifiedhealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Generative AI platform built for healthcare systems
- Organized as a public benefit corporation
- Focus on AI governance and safe deployment
