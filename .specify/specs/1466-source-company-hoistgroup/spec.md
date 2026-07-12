# Spec: 1466 — Source Company Plugin: Hoist Group

| Field | Value |
| --- | --- |
| Spec ID | 1466 |
| Slug | source-company-hoistgroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-hoistgroup` for **Hoist Group** (Provider of technology and connectivity solutions for hotels across EMEA.). Sector:
Hospitality Technology. HQ: Stockholm, Stockholm, Sweden.

The company's live postings are served by **SmartRecruiters** on company
identifier `HoistGroup` (`https://jobs.smartrecruiters.com/HoistGroup`),
which exposed **13 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-hoistgroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HOIST_GROUP`** in the source
> registry, so that a single `siteType: [Site.HOIST_GROUP]` request returns
> Hoist Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HOIST_GROUP = 'hoistgroup'` to the `Site` enum. | must |
| FR-2 | `HoistGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.HOIST_GROUP, name: 'Hoist Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'HoistGroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HOIST_GROUP`, `companyName = 'Hoist Group'`, `id` prefix `sr-`→`hoistgroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Hospitality technology and connectivity
- Serves hotels across EMEA
- Property management and network solutions
- Headquartered in Stockholm
