# Spec: 1398 — Source Company Plugin: Auberge Resorts Collection

| Field | Value |
| --- | --- |
| Spec ID | 1398 |
| Slug | source-company-aubergeresortscollection |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-aubergeresortscollection` for **Auberge Resorts Collection** (Luxury hotel and resort group with extensive restaurant and food-and-beverage operations.). Sector:
Restaurants & Hospitality (Food & Beverage). HQ: Mill Valley, California, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `AubergeCollection` (`https://jobs.smartrecruiters.com/AubergeCollection`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-aubergeresortscollection` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.AUBERGE_RESORTS_COLLECTION`** in the source
> registry, so that a single `siteType: [Site.AUBERGE_RESORTS_COLLECTION]` request returns
> Auberge Resorts Collection's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.AUBERGE_RESORTS_COLLECTION = 'aubergeresortscollection'` to the `Site` enum. | must |
| FR-2 | `AubergeResortsCollectionService` implements `IScraper`, `@SourcePlugin({ site: Site.AUBERGE_RESORTS_COLLECTION, name: 'Auberge Resorts Collection', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'AubergeCollection' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.AUBERGE_RESORTS_COLLECTION`, `companyName = 'Auberge Resorts Collection'`, `id` prefix `sr-`→`aubergeresortscollection-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Luxury resort group with property-level restaurant and F&B operations
- Hires culinary, restaurant management, and F&B staff
- Portfolio of properties across the US and internationally
- HQ in Mill Valley, California
