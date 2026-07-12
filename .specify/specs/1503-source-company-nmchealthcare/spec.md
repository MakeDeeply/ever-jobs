# Spec: 1503 — Source Company Plugin: NMC Healthcare

| Field | Value |
| --- | --- |
| Spec ID | 1503 |
| Slug | source-company-nmchealthcare |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-nmchealthcare` for **NMC Healthcare** (Private healthcare provider operating hospitals and clinics across the UAE and wider region.). Sector:
Healthcare / Hospital System. HQ: Abu Dhabi, United Arab Emirates.

The company's live postings are served by **SmartRecruiters** on company
identifier `NMCHealthcare` (`https://jobs.smartrecruiters.com/NMCHealthcare`),
which exposed **10 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-nmchealthcare` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NMC_HEALTHCARE`** in the source
> registry, so that a single `siteType: [Site.NMC_HEALTHCARE]` request returns
> NMC Healthcare's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NMC_HEALTHCARE = 'nmchealthcare'` to the `Site` enum. | must |
| FR-2 | `NMCHealthcareService` implements `IScraper`, `@SourcePlugin({ site: Site.NMC_HEALTHCARE, name: 'NMC Healthcare', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'NMCHealthcare' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NMC_HEALTHCARE`, `companyName = 'NMC Healthcare'`, `id` prefix `sr-`→`nmchealthcare-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Private hospital and clinic operator
- Based in the United Arab Emirates
- Multi-specialty inpatient and outpatient care
- Regional healthcare network
