# Spec: 1467 — Source Company Plugin: Hume City Council

| Field | Value |
| --- | --- |
| Spec ID | 1467 |
| Slug | source-company-humecitycouncil |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-humecitycouncil` for **Hume City Council** (Local government authority for the City of Hume in Victoria, Australia.). Sector:
Government / public sector (local government). HQ: Broadmeadows, Victoria, Australia.

The company's live postings are served by **SmartRecruiters** on company
identifier `HumeCityCouncil` (`https://jobs.smartrecruiters.com/HumeCityCouncil`),
which exposed **27 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-humecitycouncil` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HUME_CITY_COUNCIL`** in the source
> registry, so that a single `siteType: [Site.HUME_CITY_COUNCIL]` request returns
> Hume City Council's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HUME_CITY_COUNCIL = 'humecitycouncil'` to the `Site` enum. | must |
| FR-2 | `HumeCityCouncilService` implements `IScraper`, `@SourcePlugin({ site: Site.HUME_CITY_COUNCIL, name: 'Hume City Council', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'HumeCityCouncil' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HUME_CITY_COUNCIL`, `companyName = 'Hume City Council'`, `id` prefix `sr-`→`humecitycouncil-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Local government authority in Victoria, Australia
- Delivers community and care services
- Serves the City of Hume near Melbourne
