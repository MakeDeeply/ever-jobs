# Spec: 1579 — Source Company Plugin: Valeo Foods

| Field | Value |
| --- | --- |
| Spec ID | 1579 |
| Slug | source-company-valeofoods |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-valeofoods` for **Valeo Foods** (Food manufacturer producing snacks, confectionery, and grocery products across multiple brands.). Sector:
Food consumer goods (CPG). HQ: Dublin, Ireland.

The company's live postings are served by **SmartRecruiters** on company
identifier `valeofoods` (`https://jobs.smartrecruiters.com/valeofoods`),
which exposed **38 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-valeofoods` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.VALEO_FOODS`** in the source
> registry, so that a single `siteType: [Site.VALEO_FOODS]` request returns
> Valeo Foods's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.VALEO_FOODS = 'valeofoods'` to the `Site` enum. | must |
| FR-2 | `ValeoFoodsService` implements `IScraper`, `@SourcePlugin({ site: Site.VALEO_FOODS, name: 'Valeo Foods', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'valeofoods' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.VALEO_FOODS`, `companyName = 'Valeo Foods'`, `id` prefix `sr-`→`valeofoods-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Multi-brand food manufacturer
- Snacking, confectionery, and baking categories
- Headquartered in Dublin, Ireland
- European consumer packaged goods portfolio
