# Spec: 1529 — Source Company Plugin: Relais & Châteaux

| Field | Value |
| --- | --- |
| Spec ID | 1529 |
| Slug | source-company-relaischteaux |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-relaischteaux` for **Relais & Châteaux** (Association of independent luxury hotels and restaurants worldwide.). Sector:
Hospitality. HQ: Paris, Ile-de-France, France.

The company's live postings are served by **SmartRecruiters** on company
identifier `RelaisChateaux` (`https://jobs.smartrecruiters.com/RelaisChateaux`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-relaischteaux` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.RELAIS_CH_TEAUX`** in the source
> registry, so that a single `siteType: [Site.RELAIS_CH_TEAUX]` request returns
> Relais & Châteaux's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.RELAIS_CH_TEAUX = 'relaischteaux'` to the `Site` enum. | must |
| FR-2 | `RelaisChTeauxService` implements `IScraper`, `@SourcePlugin({ site: Site.RELAIS_CH_TEAUX, name: 'Relais & Châteaux', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'RelaisChateaux' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.RELAIS_CH_TEAUX`, `companyName = 'Relais & Châteaux'`, `id` prefix `sr-`→`relaischteaux-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Association of luxury hotels and restaurants
- Independent member properties worldwide
- Hospitality and culinary roles
- Headquartered in Paris
