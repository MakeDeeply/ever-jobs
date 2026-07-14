# Spec: 1331 — Source Company Plugin: Revefi

| Field | Value |
| --- | --- |
| Spec ID | 1331 |
| Slug | source-company-revefi |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-revefi` for
**Revefi** (Agentic-AI platform for data reliability, quality, operations, and cloud-cost optimization.). Sector: Data observability / AI platform. HQ: United States (with an office in Bangalore, India).

The company's live postings are served by **Lever** on job board
`revefi` (`https://jobs.lever.co/revefi`), which exposed
**8 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-revefi` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.REVEFI`** in the source
> registry, so that a single `siteType: [Site.REVEFI]` request returns
> Revefi's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.REVEFI = 'revefi'` to the `Site` enum. | must |
| FR-2 | `RevefiService` implements `IScraper`, `@SourcePlugin({ site: Site.REVEFI, name: 'Revefi', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'revefi' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.REVEFI`, `companyName = 'Revefi'`, `id` prefix `lever-`→`revefi-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Agentic-AI product for data reliability and cloud-cost optimization
- Founded by ThoughtSpot co-founders
- Backend engineering roles in Seattle and Bangalore
