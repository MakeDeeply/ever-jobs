# Spec: 1381 — Source Company Plugin: Aditi Staffing

| Field | Value |
| --- | --- |
| Spec ID | 1381 |
| Slug | source-company-aditistaffing |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-aditistaffing` for **Aditi Staffing** (IT staffing firm providing contract and direct-hire technology talent.). Sector:
IT staffing. HQ: Bellevue, Washington, United States.

The company's live postings are served by **SmartRecruiters** on company
identifier `AditiStaffing1` (`https://jobs.smartrecruiters.com/AditiStaffing1`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-aditistaffing` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ADITI_STAFFING`** in the source
> registry, so that a single `siteType: [Site.ADITI_STAFFING]` request returns
> Aditi Staffing's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ADITI_STAFFING = 'aditistaffing'` to the `Site` enum. | must |
| FR-2 | `AditiStaffingService` implements `IScraper`, `@SourcePlugin({ site: Site.ADITI_STAFFING, name: 'Aditi Staffing', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'AditiStaffing1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ADITI_STAFFING`, `companyName = 'Aditi Staffing'`, `id` prefix `sr-`→`aditistaffing-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- IT staffing services
- Contract and direct-hire placement
- Enterprise technology talent
