# Spec: 1358 — Source Company Plugin: Jeeves

| Field | Value |
| --- | --- |
| Spec ID | 1358 |
| Slug | source-company-tryjeeves |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-tryjeeves` for
**Jeeves** (Financial operating system offering corporate cards, cross-border payments, and spend management.). Sector: Business Fintech / Payments. HQ: New York, New York, United States.

The company's live postings are served by **Lever** on job board
`tryjeeves` (`https://jobs.lever.co/tryjeeves`), which exposed
**52 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-tryjeeves` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.JEEVES`** in the source
> registry, so that a single `siteType: [Site.JEEVES]` request returns
> Jeeves's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.JEEVES = 'tryjeeves'` to the `Site` enum. | must |
| FR-2 | `JeevesService` implements `IScraper`, `@SourcePlugin({ site: Site.JEEVES, name: 'Jeeves', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'tryjeeves' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.JEEVES`, `companyName = 'Jeeves'`, `id` prefix `lever-`→`tryjeeves-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Operates across 20+ countries including Brazil, Mexico, Canada, the UK, and the US.
- Raised over $380M in funding.
- Named Fintech of the Year at the European Fintech Awards.
