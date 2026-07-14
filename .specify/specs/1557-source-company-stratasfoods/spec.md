# Spec: 1557 — Source Company Plugin: Stratas Foods

| Field | Value |
| --- | --- |
| Spec ID | 1557 |
| Slug | source-company-stratasfoods |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-stratasfoods` for **Stratas Foods** (Manufacturer and distributor of edible oils, shortenings, and dressings.). Sector:
Food Manufacturing (Oils & Fats). HQ: Memphis, Tennessee, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `StratasFoods` (`https://jobs.smartrecruiters.com/StratasFoods`),
which exposed **55 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-stratasfoods` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.STRATAS_FOODS`** in the source
> registry, so that a single `siteType: [Site.STRATAS_FOODS]` request returns
> Stratas Foods's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.STRATAS_FOODS = 'stratasfoods'` to the `Site` enum. | must |
| FR-2 | `StratasFoodsService` implements `IScraper`, `@SourcePlugin({ site: Site.STRATAS_FOODS, name: 'Stratas Foods', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'StratasFoods' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.STRATAS_FOODS`, `companyName = 'Stratas Foods'`, `id` prefix `sr-`→`stratasfoods-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Manufactures edible oils, shortenings, and dressings
- Serves food service, retail, and ingredient customers
- Joint venture between ACH Food Companies and ADM
- HQ in Memphis, Tennessee
