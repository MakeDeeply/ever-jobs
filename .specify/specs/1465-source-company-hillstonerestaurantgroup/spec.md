# Spec: 1465 — Source Company Plugin: Hillstone Restaurant Group

| Field | Value |
| --- | --- |
| Spec ID | 1465 |
| Slug | source-company-hillstonerestaurantgroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-hillstonerestaurantgroup` for **Hillstone Restaurant Group** (Full-service restaurant company operating upscale casual dining concepts in the US.). Sector:
Restaurants (Full-Service). HQ: Beverly Hills, California, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `HillstoneRestaurantGroup` (`https://jobs.smartrecruiters.com/HillstoneRestaurantGroup`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-hillstonerestaurantgroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HILLSTONE_RESTAURANT_GROUP`** in the source
> registry, so that a single `siteType: [Site.HILLSTONE_RESTAURANT_GROUP]` request returns
> Hillstone Restaurant Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HILLSTONE_RESTAURANT_GROUP = 'hillstonerestaurantgroup'` to the `Site` enum. | must |
| FR-2 | `HillstoneRestaurantGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.HILLSTONE_RESTAURANT_GROUP, name: 'Hillstone Restaurant Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'HillstoneRestaurantGroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HILLSTONE_RESTAURANT_GROUP`, `companyName = 'Hillstone Restaurant Group'`, `id` prefix `sr-`→`hillstonerestaurantgroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Operates upscale-casual dining restaurants across the US
- Brands include Hillstone, Houston's, and R+D Kitchen
- Founded 1977
- Ongoing hiring for servers and restaurant staff
