# Spec: 1543 — Source Company Plugin: Silfab Solar

| Field | Value |
| --- | --- |
| Spec ID | 1543 |
| Slug | source-company-silfabsolar |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-silfabsolar` for **Silfab Solar** (North American manufacturer of solar photovoltaic panels and cells.). Sector:
Solar Manufacturing. HQ: Mississauga, Ontario, Canada.

The company's live postings are served by **SmartRecruiters** on company
identifier `SilfabSolar` (`https://jobs.smartrecruiters.com/SilfabSolar`),
which exposed **47 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-silfabsolar` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SILFAB_SOLAR`** in the source
> registry, so that a single `siteType: [Site.SILFAB_SOLAR]` request returns
> Silfab Solar's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SILFAB_SOLAR = 'silfabsolar'` to the `Site` enum. | must |
| FR-2 | `SilfabSolarService` implements `IScraper`, `@SourcePlugin({ site: Site.SILFAB_SOLAR, name: 'Silfab Solar', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'SilfabSolar' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SILFAB_SOLAR`, `companyName = 'Silfab Solar'`, `id` prefix `sr-`→`silfabsolar-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Solar PV module and cell manufacturing
- Manufacturing sites in Canada and Washington State
- Serves North American residential and commercial markets
- Headquartered in Mississauga, Ontario
