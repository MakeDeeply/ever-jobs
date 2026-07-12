# Spec: 1367 — Source Company Plugin: WatchGuard Technologies

| Field | Value |
| --- | --- |
| Spec ID | 1367 |
| Slug | source-company-watchguard |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-watchguard` for
**WatchGuard Technologies** (Provides network security, endpoint protection, identity, SASE, and secure Wi-Fi products.). Sector: Cloud / network security infrastructure. HQ: Seattle, Washington, United States.

The company's live postings are served by **Lever** on job board
`watchguard` (`https://jobs.lever.co/watchguard`), which exposed
**29 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-watchguard` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.WATCHGUARD_TECHNOLOGIES`** in the source
> registry, so that a single `siteType: [Site.WATCHGUARD_TECHNOLOGIES]` request returns
> WatchGuard Technologies's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.WATCHGUARD_TECHNOLOGIES = 'watchguard'` to the `Site` enum. | must |
| FR-2 | `WatchGuardTechnologiesService` implements `IScraper`, `@SourcePlugin({ site: Site.WATCHGUARD_TECHNOLOGIES, name: 'WatchGuard Technologies', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'watchguard' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.WATCHGUARD_TECHNOLOGIES`, `companyName = 'WatchGuard Technologies'`, `id` prefix `lever-`→`watchguard-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Product portfolio spans network security, endpoint, identity, SASE, and Wi-Fi
- Sells through a global MSP and partner channel
- Postings include Senior Data Engineer and SOC roles across the US and Europe
