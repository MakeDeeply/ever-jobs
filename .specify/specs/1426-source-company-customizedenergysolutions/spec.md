# Spec: 1426 — Source Company Plugin: Customized Energy Solutions

| Field | Value |
| --- | --- |
| Spec ID | 1426 |
| Slug | source-company-customizedenergysolutions |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-customizedenergysolutions` for **Customized Energy Solutions** (Provider of market intelligence and operational support services for electricity and natural gas markets.). Sector:
Energy Services. HQ: Philadelphia, Pennsylvania, United States.

The company's live postings are served by **SmartRecruiters** on company
identifier `CustomizedEnergySolutions` (`https://jobs.smartrecruiters.com/CustomizedEnergySolutions`),
which exposed **14 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-customizedenergysolutions` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CUSTOMIZED_ENERGY_SOLUTIONS`** in the source
> registry, so that a single `siteType: [Site.CUSTOMIZED_ENERGY_SOLUTIONS]` request returns
> Customized Energy Solutions's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CUSTOMIZED_ENERGY_SOLUTIONS = 'customizedenergysolutions'` to the `Site` enum. | must |
| FR-2 | `CustomizedEnergySolutionsService` implements `IScraper`, `@SourcePlugin({ site: Site.CUSTOMIZED_ENERGY_SOLUTIONS, name: 'Customized Energy Solutions', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'CustomizedEnergySolutions' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CUSTOMIZED_ENERGY_SOLUTIONS`, `companyName = 'Customized Energy Solutions'`, `id` prefix `sr-`→`customizedenergysolutions-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Wholesale/retail electricity and gas market services
- Third-party asset management of generation resources
- Renewable energy credit and compliance services
- Headquartered in Philadelphia, Pennsylvania
