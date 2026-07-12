# Spec: 1548 — Source Company Plugin: Sodexo Canada

| Field | Value |
| --- | --- |
| Spec ID | 1548 |
| Slug | source-company-sodexocanada |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-sodexocanada` for **Sodexo Canada** (Canadian arm of the global food services and facilities management company.). Sector:
Food Services & Facilities Management. HQ: Burlington, Ontario, Canada.

The company's live postings are served by **SmartRecruiters** on company
identifier `SodexoCanadaLtd` (`https://jobs.smartrecruiters.com/SodexoCanadaLtd`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-sodexocanada` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SODEXO_CANADA`** in the source
> registry, so that a single `siteType: [Site.SODEXO_CANADA]` request returns
> Sodexo Canada's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SODEXO_CANADA = 'sodexocanada'` to the `Site` enum. | must |
| FR-2 | `SodexoCanadaService` implements `IScraper`, `@SourcePlugin({ site: Site.SODEXO_CANADA, name: 'Sodexo Canada', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'SodexoCanadaLtd' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SODEXO_CANADA`, `companyName = 'Sodexo Canada'`, `id` prefix `sr-`→`sodexocanada-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Food services and catering across Canadian sites
- Corporate dining, healthcare, and education food operations
- Part of the global Sodexo group
- Large ongoing hiring across Canada
