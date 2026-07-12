# Spec: 1494 — Source Company Plugin: MedHealth

| Field | Value |
| --- | --- |
| Spec ID | 1494 |
| Slug | source-company-medhealth |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-medhealth` for **MedHealth** (Group of health, medical, and employment services businesses operating primarily in Australia.). Sector:
Healthcare Services. HQ: Sydney, New South Wales, Australia.

The company's live postings are served by **SmartRecruiters** on company
identifier `medhealth3` (`https://jobs.smartrecruiters.com/medhealth3`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-medhealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MEDHEALTH`** in the source
> registry, so that a single `siteType: [Site.MEDHEALTH]` request returns
> MedHealth's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MEDHEALTH = 'medhealth'` to the `Site` enum. | must |
| FR-2 | `MedHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.MEDHEALTH, name: 'MedHealth', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'medhealth3' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MEDHEALTH`, `companyName = 'MedHealth'`, `id` prefix `sr-`→`medhealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Health, medical, and employment services
- Occupational and allied health services
- Portfolio of specialist brands
- Operates across Australia and New Zealand
