# Spec: 1288 — Source Company Plugin: Kepler Communications

| Field | Value |
| --- | --- |
| Spec ID | 1288 |
| Slug | source-company-kepler |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-kepler` for
**Kepler Communications** (In-space data relay network connecting satellites in real time.). Sector: Space/Aerospace. HQ: Toronto, Ontario, Canada.

The company's live postings are served by **Lever** on job board
`kepler` (`https://jobs.lever.co/kepler`), which exposed
**33 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-kepler` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.KEPLER_COMMUNICATIONS`** in the source
> registry, so that a single `siteType: [Site.KEPLER_COMMUNICATIONS]` request returns
> Kepler Communications's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.KEPLER_COMMUNICATIONS = 'kepler'` to the `Site` enum. | must |
| FR-2 | `KeplerCommunicationsService` implements `IScraper`, `@SourcePlugin({ site: Site.KEPLER_COMMUNICATIONS, name: 'Kepler Communications', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'kepler' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.KEPLER_COMMUNICATIONS`, `companyName = 'Kepler Communications'`, `id` prefix `lever-`→`kepler-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Building a commercial optical data relay constellation
- Focuses on real-time in-space communications
- Hiring product, sales, and satellite avionics roles
