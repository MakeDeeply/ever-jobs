# Spec: 1383 — Source Company Plugin: AFRY

| Field | Value |
| --- | --- |
| Spec ID | 1383 |
| Slug | source-company-afry |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-afry` for **AFRY** (European engineering and consulting firm with a large energy and renewables practice.). Sector:
Energy Engineering & Consulting. HQ: Stockholm, Stockholm, Sweden.

The company's live postings are served by **SmartRecruiters** on company
identifier `AFRY` (`https://jobs.smartrecruiters.com/AFRY`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-afry` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.AFRY`** in the source
> registry, so that a single `siteType: [Site.AFRY]` request returns
> AFRY's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.AFRY = 'afry'` to the `Site` enum. | must |
| FR-2 | `AFRYService` implements `IScraper`, `@SourcePlugin({ site: Site.AFRY, name: 'AFRY', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'AFRY' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.AFRY`, `companyName = 'AFRY'`, `id` prefix `sr-`→`afry-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Energy engineering and advisory services
- Hydropower, wind, solar and grid/HVDC work
- Energy transition consulting
- Headquartered in Stockholm, Sweden
