# Spec: 1518 — Source Company Plugin: Platinum Healthcare Staffing

| Field | Value |
| --- | --- |
| Spec ID | 1518 |
| Slug | source-company-platinumhealthcarestaffing |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-platinumhealthcarestaffing` for **Platinum Healthcare Staffing** (Staffing agency placing nurses and healthcare professionals across the United States.). Sector:
Healthcare Staffing. HQ: Los Angeles, California, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `PlatinumHealthcareStaffingInc` (`https://jobs.smartrecruiters.com/PlatinumHealthcareStaffingInc`),
which exposed **14 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-platinumhealthcarestaffing` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PLATINUM_HEALTHCARE_STAFFING`** in the source
> registry, so that a single `siteType: [Site.PLATINUM_HEALTHCARE_STAFFING]` request returns
> Platinum Healthcare Staffing's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PLATINUM_HEALTHCARE_STAFFING = 'platinumhealthcarestaffing'` to the `Site` enum. | must |
| FR-2 | `PlatinumHealthcareStaffingService` implements `IScraper`, `@SourcePlugin({ site: Site.PLATINUM_HEALTHCARE_STAFFING, name: 'Platinum Healthcare Staffing', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'PlatinumHealthcareStaffingInc' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PLATINUM_HEALTHCARE_STAFFING`, `companyName = 'Platinum Healthcare Staffing'`, `id` prefix `sr-`→`platinumhealthcarestaffing-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Nurse and healthcare staffing agency
- Travel and contract clinical placements
- Serves hospitals and healthcare facilities
- Covers multiple clinical specialties
