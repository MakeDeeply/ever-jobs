# Spec: 1552 — Source Company Plugin: Staffing Medical USA

| Field | Value |
| --- | --- |
| Spec ID | 1552 |
| Slug | source-company-staffingmedicalusa |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-staffingmedicalusa` for **Staffing Medical USA** (Medical staffing company recruiting and placing healthcare professionals in the US.). Sector:
Healthcare Staffing. HQ: Batesville, Arkansas, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `StaffingMedicalUSA` (`https://jobs.smartrecruiters.com/StaffingMedicalUSA`),
which exposed **4 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-staffingmedicalusa` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.STAFFING_MEDICAL_USA`** in the source
> registry, so that a single `siteType: [Site.STAFFING_MEDICAL_USA]` request returns
> Staffing Medical USA's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.STAFFING_MEDICAL_USA = 'staffingmedicalusa'` to the `Site` enum. | must |
| FR-2 | `StaffingMedicalUSAService` implements `IScraper`, `@SourcePlugin({ site: Site.STAFFING_MEDICAL_USA, name: 'Staffing Medical USA', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'StaffingMedicalUSA' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.STAFFING_MEDICAL_USA`, `companyName = 'Staffing Medical USA'`, `id` prefix `sr-`→`staffingmedicalusa-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Medical and nursing staffing
- Recruits and places healthcare professionals
- Supports facilities' clinical hiring
- US-based staffing operations
