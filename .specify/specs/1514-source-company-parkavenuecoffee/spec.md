# Spec: 1514 — Source Company Plugin: Park Avenue Coffee

| Field | Value |
| --- | --- |
| Spec ID | 1514 |
| Slug | source-company-parkavenuecoffee |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-parkavenuecoffee` for **Park Avenue Coffee** (St. Louis coffee and bakery company operating cafes and a bakery.). Sector:
Food & Beverage (Coffee & Bakery). HQ: St. Louis, Missouri, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `ParkAvenueCoffee` (`https://jobs.smartrecruiters.com/ParkAvenueCoffee`),
which exposed **8 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-parkavenuecoffee` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PARK_AVENUE_COFFEE`** in the source
> registry, so that a single `siteType: [Site.PARK_AVENUE_COFFEE]` request returns
> Park Avenue Coffee's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PARK_AVENUE_COFFEE = 'parkavenuecoffee'` to the `Site` enum. | must |
| FR-2 | `ParkAvenueCoffeeService` implements `IScraper`, `@SourcePlugin({ site: Site.PARK_AVENUE_COFFEE, name: 'Park Avenue Coffee', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ParkAvenueCoffee' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PARK_AVENUE_COFFEE`, `companyName = 'Park Avenue Coffee'`, `id` prefix `sr-`→`parkavenuecoffee-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Coffee and bakery company in St. Louis, Missouri
- Operates cafes and an in-house bakery
- Hires bakers, baristas, and production staff
- Known locally for gooey butter cake
