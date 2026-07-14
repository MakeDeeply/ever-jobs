# Spec: 1235 — Source Company Plugin: DeleteMe

| Field | Value |
| --- | --- |
| Spec ID | 1235 |
| Slug | source-company-deleteme |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-deleteme` for
**DeleteMe** (Privacy protection service that continuously removes exposed personal data from data brokers and the open web.). Sector: Privacy (Personal Data Removal). HQ: Boston, Massachusetts, United States.

The company's live postings are served by **Lever** on job board
`deleteme` (`https://jobs.lever.co/deleteme`), which exposed
**6 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-deleteme` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DELETEME`** in the source
> registry, so that a single `siteType: [Site.DELETEME]` request returns
> DeleteMe's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DELETEME = 'deleteme'` to the `Site` enum. | must |
| FR-2 | `DeleteMeService` implements `IScraper`, `@SourcePlugin({ site: Site.DELETEME, name: 'DeleteMe', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'deleteme' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DELETEME`, `companyName = 'DeleteMe'`, `id` prefix `lever-`→`deleteme-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Continuous removal of PII from data brokers and the open web
- Serves both consumer and enterprise (executive) markets
- Focus on reducing human attack surface
- Privacy advisory and cybersecurity product teams
