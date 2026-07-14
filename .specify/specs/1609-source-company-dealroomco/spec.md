# Spec: 1609 — Source Company Plugin: Dealroom.co

| Field | Value |
| --- | --- |
| Spec ID | 1609 |
| Slug | source-company-dealroomco |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-dealroomco` for **Dealroom.co** (Data platform providing intelligence on startups, scaleups, investors, and tech ecosystems.). Sector:
Data / market intelligence SaaS. HQ: Amsterdam, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`dealroomco` (`https://dealroomco.recruitee.com`), which exposed
**4 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-dealroomco` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DEALROOM_CO`** in the source
> registry, so that a single `siteType: [Site.DEALROOM_CO]` request returns
> Dealroom.co's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DEALROOM_CO = 'dealroomco'` to the `Site` enum. | must |
| FR-2 | `DealroomCoService` implements `IScraper`, `@SourcePlugin({ site: Site.DEALROOM_CO, name: 'Dealroom.co', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'dealroomco' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DEALROOM_CO`, `companyName = 'Dealroom.co'`, `id` prefix `recruitee-`→`dealroomco-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Amsterdam-based startup/investor data platform
- Serves investors, corporates, and governments
- Recruitee board dealroomco.recruitee.com verified
