# Spec: 1558 — Source Company Plugin: Strategic Staffing Solutions (S3)

| Field | Value |
| --- | --- |
| Spec ID | 1558 |
| Slug | source-company-strategicstaffingsolutionss3 |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-strategicstaffingsolutionss3` for **Strategic Staffing Solutions (S3)** (IT staffing and consulting firm founded in 1990.). Sector:
IT staffing and consulting. HQ: Detroit, Michigan, United States.

The company's live postings are served by **SmartRecruiters** on company
identifier `StrategicStaffingSolutionsS3` (`https://jobs.smartrecruiters.com/StrategicStaffingSolutionsS3`),
which exposed **8 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-strategicstaffingsolutionss3` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.STRATEGIC_STAFFING_SOLUTIONS_S3`** in the source
> registry, so that a single `siteType: [Site.STRATEGIC_STAFFING_SOLUTIONS_S3]` request returns
> Strategic Staffing Solutions (S3)'s live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.STRATEGIC_STAFFING_SOLUTIONS_S3 = 'strategicstaffingsolutionss3'` to the `Site` enum. | must |
| FR-2 | `StrategicStaffingSolutionsS3Service` implements `IScraper`, `@SourcePlugin({ site: Site.STRATEGIC_STAFFING_SOLUTIONS_S3, name: 'Strategic Staffing Solutions (S3)', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'StrategicStaffingSolutionsS3' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.STRATEGIC_STAFFING_SOLUTIONS_S3`, `companyName = 'Strategic Staffing Solutions (S3)'`, `id` prefix `sr-`→`strategicstaffingsolutionss3-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- IT staffing and consulting
- Staff augmentation
- Founded 1990
