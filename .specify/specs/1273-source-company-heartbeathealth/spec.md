# Spec: 1273 — Source Company Plugin: Heartbeat Health

| Field | Value |
| --- | --- |
| Spec ID | 1273 |
| Slug | source-company-heartbeathealth |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-heartbeathealth` for
**Heartbeat Health** (Virtual-first cardiovascular care platform for patients and health systems.). Sector: Digital Health. HQ: New York, New York, USA.

The company's live postings are served by **Lever** on job board
`heartbeathealth` (`https://jobs.lever.co/heartbeathealth`), which exposed
**27 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-heartbeathealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HEARTBEAT_HEALTH`** in the source
> registry, so that a single `siteType: [Site.HEARTBEAT_HEALTH]` request returns
> Heartbeat Health's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HEARTBEAT_HEALTH = 'heartbeathealth'` to the `Site` enum. | must |
| FR-2 | `HeartbeatHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.HEARTBEAT_HEALTH, name: 'Heartbeat Health', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'heartbeathealth' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HEARTBEAT_HEALTH`, `companyName = 'Heartbeat Health'`, `id` prefix `lever-`→`heartbeathealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Virtual-first cardiovascular care model
- Network of cardiologists and diagnostic services
- Partners with health systems and payers
