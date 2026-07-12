# Spec: 1284 — Source Company Plugin: Insider

| Field | Value |
| --- | --- |
| Spec ID | 1284 |
| Slug | source-company-insiderone |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-insiderone` for
**Insider** (AI-native customer engagement and marketing platform for enterprises.). Sector: B2B SaaS / Marketing Technology. HQ: Istanbul, Istanbul, Turkey.

The company's live postings are served by **Lever** on job board
`insiderone` (`https://jobs.lever.co/insiderone`), which exposed
**148 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-insiderone` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.INSIDER`** in the source
> registry, so that a single `siteType: [Site.INSIDER]` request returns
> Insider's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.INSIDER = 'insiderone'` to the `Site` enum. | must |
| FR-2 | `InsiderService` implements `IScraper`, `@SourcePlugin({ site: Site.INSIDER, name: 'Insider', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'insiderone' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.INSIDER`, `companyName = 'Insider'`, `id` prefix `lever-`→`insiderone-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Cross-channel customer engagement and personalization platform
- Global sales roles across DACH, US, Australia, and LATAM
- Roles concentrated in enterprise account management
