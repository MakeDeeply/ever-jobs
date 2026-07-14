# Spec: 1258 — Source Company Plugin: Fun.xyz

| Field | Value |
| --- | --- |
| Spec ID | 1258 |
| Slug | source-company-funxyz |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-funxyz` for
**Fun.xyz** (Web3 payments and onchain infrastructure company building crypto developer tooling.). Sector: Web3 Infrastructure. HQ: San Francisco, California, United States.

The company's live postings are served by **Lever** on job board
`funxyz` (`https://jobs.lever.co/funxyz`), which exposed
**10 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-funxyz` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FUN_XYZ`** in the source
> registry, so that a single `siteType: [Site.FUN_XYZ]` request returns
> Fun.xyz's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FUN_XYZ = 'funxyz'` to the `Site` enum. | must |
| FR-2 | `FunXyzService` implements `IScraper`, `@SourcePlugin({ site: Site.FUN_XYZ, name: 'Fun.xyz', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'funxyz' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FUN_XYZ`, `companyName = 'Fun.xyz'`, `id` prefix `lever-`→`funxyz-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops onchain payments infrastructure across multiple chains.
- Provides protocol and backend engineering tooling for Web3 apps.
- Lever postings include protocol, backend, and business development roles.
