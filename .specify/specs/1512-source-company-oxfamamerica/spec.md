# Spec: 1512 — Source Company Plugin: Oxfam America

| Field | Value |
| --- | --- |
| Spec ID | 1512 |
| Slug | source-company-oxfamamerica |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-oxfamamerica` for **Oxfam America** (U.S. affiliate of the global Oxfam confederation working on poverty, inequality, and humanitarian response.). Sector:
Non-profit (international development / humanitarian). HQ: Boston, Massachusetts, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `oxfamamerica2` (`https://jobs.smartrecruiters.com/oxfamamerica2`),
which exposed **13 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-oxfamamerica` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.OXFAM_AMERICA`** in the source
> registry, so that a single `siteType: [Site.OXFAM_AMERICA]` request returns
> Oxfam America's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.OXFAM_AMERICA = 'oxfamamerica'` to the `Site` enum. | must |
| FR-2 | `OxfamAmericaService` implements `IScraper`, `@SourcePlugin({ site: Site.OXFAM_AMERICA, name: 'Oxfam America', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'oxfamamerica2' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.OXFAM_AMERICA`, `companyName = 'Oxfam America'`, `id` prefix `sr-`→`oxfamamerica-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- U.S. affiliate of the global Oxfam confederation
- Focus on poverty, inequality, and humanitarian response
- Non-profit organization
