# Spec: 1322 — Source Company Plugin: Princess Polly

| Field | Value |
| --- | --- |
| Spec ID | 1322 |
| Slug | source-company-princesspolly |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-princesspolly` for
**Princess Polly** (Online women's fashion brand with a growing US retail footprint.). Sector: Retail / Fashion e-commerce. HQ: Los Angeles, California, USA.

The company's live postings are served by **Lever** on job board
`princesspolly` (`https://jobs.lever.co/princesspolly`), which exposed
**52 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-princesspolly` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PRINCESS_POLLY`** in the source
> registry, so that a single `siteType: [Site.PRINCESS_POLLY]` request returns
> Princess Polly's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PRINCESS_POLLY = 'princesspolly'` to the `Site` enum. | must |
| FR-2 | `PrincessPollyService` implements `IScraper`, `@SourcePlugin({ site: Site.PRINCESS_POLLY, name: 'Princess Polly', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'princesspolly' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PRINCESS_POLLY`, `companyName = 'Princess Polly'`, `id` prefix `lever-`→`princesspolly-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Direct-to-consumer online women's fashion brand
- Corporate offices in Los Angeles and the Gold Coast, Australia
- Physical retail stores across the US and Australia
