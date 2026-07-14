# Spec: 1409 — Source Company Plugin: Carilion Clinic

| Field | Value |
| --- | --- |
| Spec ID | 1409 |
| Slug | source-company-carilionclinic |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-carilionclinic` for **Carilion Clinic** (Not-for-profit integrated health system serving southwest Virginia.). Sector:
Healthcare / Hospital System. HQ: Roanoke, Virginia, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `CarilionClinic` (`https://jobs.smartrecruiters.com/CarilionClinic`),
which exposed **10 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-carilionclinic` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CARILION_CLINIC`** in the source
> registry, so that a single `siteType: [Site.CARILION_CLINIC]` request returns
> Carilion Clinic's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CARILION_CLINIC = 'carilionclinic'` to the `Site` enum. | must |
| FR-2 | `CarilionClinicService` implements `IScraper`, `@SourcePlugin({ site: Site.CARILION_CLINIC, name: 'Carilion Clinic', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'CarilionClinic' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CARILION_CLINIC`, `companyName = 'Carilion Clinic'`, `id` prefix `sr-`→`carilionclinic-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Integrated not-for-profit health system
- Serves southwest Virginia
- Hospitals and physician practices
- Affiliated with a medical school
