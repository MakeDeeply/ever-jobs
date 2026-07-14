# Spec: 1197 — Source Company Plugin: Agiloft

| Field | Value |
| --- | --- |
| Spec ID | 1197 |
| Slug | source-company-agiloft |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-agiloft` for
**Agiloft** (Data-first, AI-enabled contract lifecycle management (CLM) platform.). Sector: SaaS / no-code platform. HQ: Redwood City, California, United States.

The company's live postings are served by **Lever** on job board
`agiloft` (`https://jobs.lever.co/agiloft`), which exposed
**8 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-agiloft` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.AGILOFT`** in the source
> registry, so that a single `siteType: [Site.AGILOFT]` request returns
> Agiloft's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.AGILOFT = 'agiloft'` to the `Site` enum. | must |
| FR-2 | `AgiloftService` implements `IScraper`, `@SourcePlugin({ site: Site.AGILOFT, name: 'Agiloft', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'agiloft' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.AGILOFT`, `companyName = 'Agiloft'`, `id` prefix `lever-`→`agiloft-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- API-first, no-code contract lifecycle management platform
- AI-enabled contract management across the full lifecycle
- Postings include Senior Platform Engineer roles
