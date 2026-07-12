# Spec: 1225 — Source Company Plugin: Collate

| Field | Value |
| --- | --- |
| Spec ID | 1225 |
| Slug | source-company-collate |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-collate` for
**Collate** (Provides an AI document-generation platform for life-sciences regulatory work.). Sector: Applied AI / life sciences. HQ: San Francisco, California, USA.

The company's live postings are served by **Lever** on job board
`collate` (`https://jobs.lever.co/collate`), which exposed
**16 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-collate` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.COLLATE`** in the source
> registry, so that a single `siteType: [Site.COLLATE]` request returns
> Collate's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.COLLATE = 'collate'` to the `Site` enum. | must |
| FR-2 | `CollateService` implements `IScraper`, `@SourcePlugin({ site: Site.COLLATE, name: 'Collate', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'collate' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.COLLATE`, `companyName = 'Collate'`, `id` prefix `lever-`→`collate-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Automates life-sciences regulatory and development documents with AI
- End-to-end platform across drug, diagnostic and device development
- Roles include AI engineering and AI research science
- Headquartered in San Francisco
