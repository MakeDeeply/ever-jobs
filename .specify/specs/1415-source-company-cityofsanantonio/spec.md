# Spec: 1415 — Source Company Plugin: City of San Antonio

| Field | Value |
| --- | --- |
| Spec ID | 1415 |
| Slug | source-company-cityofsanantonio |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-cityofsanantonio` for **City of San Antonio** (Municipal government of San Antonio, Texas.). Sector:
Government / public sector (municipal government). HQ: San Antonio, Texas, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `CityOfSanAntonio` (`https://jobs.smartrecruiters.com/CityOfSanAntonio`),
which exposed **7 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-cityofsanantonio` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CITY_OF_SAN_ANTONIO`** in the source
> registry, so that a single `siteType: [Site.CITY_OF_SAN_ANTONIO]` request returns
> City of San Antonio's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CITY_OF_SAN_ANTONIO = 'cityofsanantonio'` to the `Site` enum. | must |
| FR-2 | `CityOfSanAntonioService` implements `IScraper`, `@SourcePlugin({ site: Site.CITY_OF_SAN_ANTONIO, name: 'City of San Antonio', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'CityOfSanAntonio' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CITY_OF_SAN_ANTONIO`, `companyName = 'City of San Antonio'`, `id` prefix `sr-`→`cityofsanantonio-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Municipal government of San Antonio, Texas
- Roles span public safety, health, and city services
