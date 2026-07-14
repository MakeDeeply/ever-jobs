# Spec: 1459 — Source Company Plugin: Grupo Mariposa (Regional)

| Field | Value |
| --- | --- |
| Spec ID | 1459 |
| Slug | source-company-grupomariposaregional |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-grupomariposaregional` for **Grupo Mariposa (Regional)** (Regional careers channel of the Central American food and beverage conglomerate.). Sector:
Food & Beverage (Bottling & Consumer Goods). HQ: Guatemala City, Guatemala.

The company's live postings are served by **SmartRecruiters** on company
identifier `GrupoMariposa` (`https://jobs.smartrecruiters.com/GrupoMariposa`),
which exposed **49 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-grupomariposaregional` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.GRUPO_MARIPOSA_REGIONAL`** in the source
> registry, so that a single `siteType: [Site.GRUPO_MARIPOSA_REGIONAL]` request returns
> Grupo Mariposa (Regional)'s live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.GRUPO_MARIPOSA_REGIONAL = 'grupomariposaregional'` to the `Site` enum. | must |
| FR-2 | `GrupoMariposaRegionalService` implements `IScraper`, `@SourcePlugin({ site: Site.GRUPO_MARIPOSA_REGIONAL, name: 'Grupo Mariposa (Regional)', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'GrupoMariposa' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.GRUPO_MARIPOSA_REGIONAL`, `companyName = 'Grupo Mariposa (Regional)'`, `id` prefix `sr-`→`grupomariposaregional-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Food and beverage conglomerate headquartered in Guatemala
- Beverage bottling, distribution, and snacks
- Operations across Latin American markets
- Regional hiring channel
