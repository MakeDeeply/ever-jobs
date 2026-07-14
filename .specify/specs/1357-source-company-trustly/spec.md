# Spec: 1357 — Source Company Plugin: Trustly

| Field | Value |
| --- | --- |
| Spec ID | 1357 |
| Slug | source-company-trustly |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-trustly` for
**Trustly** (Open Banking payments network enabling account-to-account (Pay by Bank) transactions.). Sector: Payments / Open Banking. HQ: Stockholm, Stockholm County, Sweden.

The company's live postings are served by **Lever** on job board
`trustly` (`https://jobs.lever.co/trustly`), which exposed
**21 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-trustly` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TRUSTLY`** in the source
> registry, so that a single `siteType: [Site.TRUSTLY]` request returns
> Trustly's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TRUSTLY = 'trustly'` to the `Site` enum. | must |
| FR-2 | `TrustlyService` implements `IScraper`, `@SourcePlugin({ site: Site.TRUSTLY, name: 'Trustly', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'trustly' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TRUSTLY`, `companyName = 'Trustly'`, `id` prefix `lever-`→`trustly-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Global leader in Open Banking (Pay by Bank) payments.
- Operates across the US, Canada, Brazil, and Europe with hubs including London, Lisbon, and Stockholm.
- Roles span finance, security, and payments operations.
