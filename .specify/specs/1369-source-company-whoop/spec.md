# Spec: 1369 — Source Company Plugin: WHOOP

| Field | Value |
| --- | --- |
| Spec ID | 1369 |
| Slug | source-company-whoop |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-whoop` for
**WHOOP** (Wearable technology company for continuous physiological and health monitoring.). Sector: Health Tech / Wearables. HQ: Boston, Massachusetts, USA.

The company's live postings are served by **Lever** on job board
`whoop` (`https://jobs.lever.co/whoop`), which exposed
**158 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-whoop` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.WHOOP`** in the source
> registry, so that a single `siteType: [Site.WHOOP]` request returns
> WHOOP's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.WHOOP = 'whoop'` to the `Site` enum. | must |
| FR-2 | `WHOOPService` implements `IScraper`, `@SourcePlugin({ site: Site.WHOOP, name: 'WHOOP', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'whoop' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.WHOOP`, `companyName = 'WHOOP'`, `id` prefix `lever-`→`whoop-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Subscription-based wearable and analytics platform
- Tracks recovery, strain, and sleep metrics
- Building healthcare-focused product features
