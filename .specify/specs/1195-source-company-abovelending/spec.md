# Spec: 1195 — Source Company Plugin: Above Lending

| Field | Value |
| --- | --- |
| Spec ID | 1195 |
| Slug | source-company-abovelending |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-abovelending` for
**Above Lending** (Consumer lending company offering personal loans and debt-consolidation products.). Sector: Consumer Lending. HQ: Chicago, Illinois, United States.

The company's live postings are served by **Lever** on job board
`abovelending` (`https://jobs.lever.co/abovelending`), which exposed
**3 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-abovelending` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ABOVE_LENDING`** in the source
> registry, so that a single `siteType: [Site.ABOVE_LENDING]` request returns
> Above Lending's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ABOVE_LENDING = 'abovelending'` to the `Site` enum. | must |
| FR-2 | `AboveLendingService` implements `IScraper`, `@SourcePlugin({ site: Site.ABOVE_LENDING, name: 'Above Lending', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'abovelending' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ABOVE_LENDING`, `companyName = 'Above Lending'`, `id` prefix `lever-`→`abovelending-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Chicago-based with a hybrid downtown office.
- Focuses on credit strategy and loan performance analytics.
- Products aimed at helping clients consolidate debt and manage personal finances.
