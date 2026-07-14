# Spec: 1504 — Source Company Plugin: North 40 Outfitters

| Field | Value |
| --- | --- |
| Spec ID | 1504 |
| Slug | source-company-north40outfitters |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-north40outfitters` for **North 40 Outfitters** (Regional farm, ranch, and outdoor lifestyle retailer in the US Pacific Northwest and Mountain West.). Sector:
Retail (farm, ranch & outdoor goods). HQ: Havre, Montana, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `North40Outfitters` (`https://jobs.smartrecruiters.com/North40Outfitters`),
which exposed **65 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-north40outfitters` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NORTH_40_OUTFITTERS`** in the source
> registry, so that a single `siteType: [Site.NORTH_40_OUTFITTERS]` request returns
> North 40 Outfitters's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NORTH_40_OUTFITTERS = 'north40outfitters'` to the `Site` enum. | must |
| FR-2 | `North40OutfittersService` implements `IScraper`, `@SourcePlugin({ site: Site.NORTH_40_OUTFITTERS, name: 'North 40 Outfitters', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'North40Outfitters' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NORTH_40_OUTFITTERS`, `companyName = 'North 40 Outfitters'`, `id` prefix `sr-`→`north40outfitters-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Farm, ranch, and outdoor lifestyle retailer
- Operates in the US Pacific Northwest and Mountain West
- Sells apparel, footwear, tools, and agricultural supplies
- Both physical stores and e-commerce
