# Spec: 1373 — Source Company Plugin: Xsolla

| Field | Value |
| --- | --- |
| Spec ID | 1373 |
| Slug | source-company-xsolla |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-xsolla` for
**Xsolla** (Video game commerce company providing payment and monetization tools for developers.). Sector: gaming. HQ: Los Angeles, California, United States.

The company's live postings are served by **Lever** on job board
`xsolla` (`https://jobs.lever.co/xsolla`), which exposed
**160 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-xsolla` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.XSOLLA`** in the source
> registry, so that a single `siteType: [Site.XSOLLA]` request returns
> Xsolla's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.XSOLLA = 'xsolla'` to the `Site` enum. | must |
| FR-2 | `XsollaService` implements `IScraper`, `@SourcePlugin({ site: Site.XSOLLA, name: 'Xsolla', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'xsolla' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.XSOLLA`, `companyName = 'Xsolla'`, `id` prefix `lever-`→`xsolla-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Payment and commerce infrastructure for game developers
- Serves game studios and publishers worldwide
- Hiring across sales, engineering and developer relations
