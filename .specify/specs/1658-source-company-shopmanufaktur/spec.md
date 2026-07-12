# Spec: 1658 — Source Company Plugin: Shop Manufaktur

| Field | Value |
| --- | --- |
| Spec ID | 1658 |
| Slug | source-company-shopmanufaktur |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-shopmanufaktur` for **Shop Manufaktur** (Bremen-based e-commerce company operating online shops, with hiring focused on Shopify and online-marketing roles.). Sector:
E-commerce (online shop operator). HQ: Bremen, Germany.

The company's live postings are served by **Recruitee** on subdomain
`shopmanufaktur` (`https://shopmanufaktur.recruitee.com`), which exposed
**8 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-shopmanufaktur` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SHOP_MANUFAKTUR`** in the source
> registry, so that a single `siteType: [Site.SHOP_MANUFAKTUR]` request returns
> Shop Manufaktur's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SHOP_MANUFAKTUR = 'shopmanufaktur'` to the `Site` enum. | must |
| FR-2 | `ShopManufakturService` implements `IScraper`, `@SourcePlugin({ site: Site.SHOP_MANUFAKTUR, name: 'Shop Manufaktur', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'shopmanufaktur' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SHOP_MANUFAKTUR`, `companyName = 'Shop Manufaktur'`, `id` prefix `recruitee-`→`shopmanufaktur-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified board shopmanufaktur.recruitee.com/api/offers returned an offers array with 9 entries
- Headquartered in Bremen, Germany
- Hiring centered on Shopify e-commerce management and online marketing
- All listed positions are Bremen-based full-time roles
