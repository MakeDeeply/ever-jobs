# Spec: 1483 — Source Company Plugin: Lakeshore Learning Materials

| Field | Value |
| --- | --- |
| Spec ID | 1483 |
| Slug | source-company-lakeshorelearningmaterials |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-lakeshorelearningmaterials` for **Lakeshore Learning Materials** (Developer and retailer of educational materials for schools, teachers, and families.). Sector:
Education (educational products and materials). HQ: Carson, California, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `Lakeshore` (`https://jobs.smartrecruiters.com/Lakeshore`),
which exposed **80 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-lakeshorelearningmaterials` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LAKESHORE_LEARNING_MATERIALS`** in the source
> registry, so that a single `siteType: [Site.LAKESHORE_LEARNING_MATERIALS]` request returns
> Lakeshore Learning Materials's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LAKESHORE_LEARNING_MATERIALS = 'lakeshorelearningmaterials'` to the `Site` enum. | must |
| FR-2 | `LakeshoreLearningMaterialsService` implements `IScraper`, `@SourcePlugin({ site: Site.LAKESHORE_LEARNING_MATERIALS, name: 'Lakeshore Learning Materials', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Lakeshore' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LAKESHORE_LEARNING_MATERIALS`, `companyName = 'Lakeshore Learning Materials'`, `id` prefix `sr-`→`lakeshorelearningmaterials-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Educational materials for early childhood and K-12
- Serves teachers, schools, and families
- Operates retail and distribution operations
