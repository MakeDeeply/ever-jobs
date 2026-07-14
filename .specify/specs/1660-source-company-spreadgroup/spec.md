# Spec: 1660 — Source Company Plugin: Spread Group

| Field | Value |
| --- | --- |
| Spec ID | 1660 |
| Slug | source-company-spreadgroup |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-spreadgroup` for **Spread Group** (Leipzig-based print-on-demand e-commerce group (Spreadshirt, Spreadshop) selling made-to-order customized apparel and lifestyle products.). Sector:
E-commerce / print-on-demand marketplace. HQ: Leipzig, Germany.

The company's live postings are served by **Recruitee** on subdomain
`spreadgroup` (`https://spreadgroup.recruitee.com`), which exposed
**12 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-spreadgroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SPREAD_GROUP`** in the source
> registry, so that a single `siteType: [Site.SPREAD_GROUP]` request returns
> Spread Group's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SPREAD_GROUP = 'spreadgroup'` to the `Site` enum. | must |
| FR-2 | `SpreadGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.SPREAD_GROUP, name: 'Spread Group', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'spreadgroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SPREAD_GROUP`, `companyName = 'Spread Group'`, `id` prefix `recruitee-`→`spreadgroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified board spreadgroup.recruitee.com/api/offers returned an offers array with 6 entries
- Headquartered in Leipzig, Saxony
- Operates the Spreadshirt and Spreadshop print-on-demand brands (made-to-order technology)
- Roles span strategic partnerships, payments/treasury operations and production (embroidery)
