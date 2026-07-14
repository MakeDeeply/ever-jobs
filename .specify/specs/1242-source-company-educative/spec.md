# Spec: 1242 — Source Company Plugin: Educative

| Field | Value |
| --- | --- |
| Spec ID | 1242 |
| Slug | source-company-educative |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-educative` for
**Educative** (Interactive online learning platform for software developers.). Sector: education. HQ: Seattle, Washington, United States.

The company's live postings are served by **Lever** on job board
`educative` (`https://jobs.lever.co/educative`), which exposed
**10 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-educative` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.EDUCATIVE`** in the source
> registry, so that a single `siteType: [Site.EDUCATIVE]` request returns
> Educative's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.EDUCATIVE = 'educative'` to the `Site` enum. | must |
| FR-2 | `EducativeService` implements `IScraper`, `@SourcePlugin({ site: Site.EDUCATIVE, name: 'Educative', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'educative' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.EDUCATIVE`, `companyName = 'Educative'`, `id` prefix `lever-`→`educative-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Interactive online courses for developers
- Text-based, hands-on learning format
- Hiring across content, finance and operations
