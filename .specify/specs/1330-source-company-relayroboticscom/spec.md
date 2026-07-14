# Spec: 1330 — Source Company Plugin: Relay Robotics

| Field | Value |
| --- | --- |
| Spec ID | 1330 |
| Slug | source-company-relayroboticscom |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-relayroboticscom` for
**Relay Robotics** (Autonomous service robots for hotels, hospitals, and multi-tenant buildings.). Sector: Robotics. HQ: Campbell, California, United States.

The company's live postings are served by **Lever** on job board
`relayrobotics.com` (`https://jobs.lever.co/relayrobotics.com`), which exposed
**4 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-relayroboticscom` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.RELAY_ROBOTICS`** in the source
> registry, so that a single `siteType: [Site.RELAY_ROBOTICS]` request returns
> Relay Robotics's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.RELAY_ROBOTICS = 'relayroboticscom'` to the `Site` enum. | must |
| FR-2 | `RelayRoboticsService` implements `IScraper`, `@SourcePlugin({ site: Site.RELAY_ROBOTICS, name: 'Relay Robotics', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'relayrobotics.com' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.RELAY_ROBOTICS`, `companyName = 'Relay Robotics'`, `id` prefix `lever-`→`relayroboticscom-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Autonomous indoor delivery robots
- Deployed in hospitality and residential settings
- Hiring field technicians and sales staff
