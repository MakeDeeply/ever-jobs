# Spec: 1198 — Source Company Plugin: Aircall

| Field | Value |
| --- | --- |
| Spec ID | 1198 |
| Slug | source-company-aircall |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-aircall` for
**Aircall** (Cloud-based phone and customer communications platform for businesses.). Sector: B2B SaaS / Cloud Communications. HQ: Paris, Ile-de-France, France.

The company's live postings are served by **Lever** on job board
`aircall` (`https://jobs.lever.co/aircall`), which exposed
**89 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-aircall` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.AIRCALL`** in the source
> registry, so that a single `siteType: [Site.AIRCALL]` request returns
> Aircall's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.AIRCALL = 'aircall'` to the `Site` enum. | must |
| FR-2 | `AircallService` implements `IScraper`, `@SourcePlugin({ site: Site.AIRCALL, name: 'Aircall', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'aircall' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.AIRCALL`, `companyName = 'Aircall'`, `id` prefix `lever-`→`aircall-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Cloud phone system integrated with business tools
- Offices in Paris, New York, Berlin, and Sydney
- Roles in sales, marketing, and engineering
