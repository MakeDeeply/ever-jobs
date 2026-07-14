# Spec: 1275 — Source Company Plugin: Rowan

| Field | Value |
| --- | --- |
| Spec ID | 1275 |
| Slug | source-company-heyrowan |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-heyrowan` for
**Rowan** (Ear-piercing and jewelry retailer with studios staffed by licensed nurses.). Sector: Retail / Consumer. HQ: Larchmont, New York, USA.

The company's live postings are served by **Lever** on job board
`heyrowan` (`https://jobs.lever.co/heyrowan`), which exposed
**79 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-heyrowan` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ROWAN`** in the source
> registry, so that a single `siteType: [Site.ROWAN]` request returns
> Rowan's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ROWAN = 'heyrowan'` to the `Site` enum. | must |
| FR-2 | `RowanService` implements `IScraper`, `@SourcePlugin({ site: Site.ROWAN, name: 'Rowan', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'heyrowan' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ROWAN`, `companyName = 'Rowan'`, `id` prefix `lever-`→`heyrowan-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Ear piercing performed by licensed nurses
- Retail studios across several US states
- Sells its own jewelry line online and in-store
