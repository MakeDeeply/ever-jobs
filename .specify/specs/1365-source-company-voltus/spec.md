# Spec: 1365 — Source Company Plugin: Voltus

| Field | Value |
| --- | --- |
| Spec ID | 1365 |
| Slug | source-company-voltus |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-voltus` for
**Voltus** (Virtual power plant operator that aggregates distributed energy resources and pays users to shift electricity demand.). Sector: Energy / Demand response. HQ: San Francisco, California, USA.

The company's live postings are served by **Lever** on job board
`voltus` (`https://jobs.lever.co/voltus`), which exposed
**16 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-voltus` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.VOLTUS`** in the source
> registry, so that a single `siteType: [Site.VOLTUS]` request returns
> Voltus's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.VOLTUS = 'voltus'` to the `Site` enum. | must |
| FR-2 | `VoltusService` implements `IScraper`, `@SourcePlugin({ site: Site.VOLTUS, name: 'Voltus', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'voltus' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.VOLTUS`, `companyName = 'Voltus'`, `id` prefix `lever-`→`voltus-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Virtual power plant / demand-response operator
- Connects distributed energy resources to markets in the US and Canada
- Fully remote roles across product and energy markets
