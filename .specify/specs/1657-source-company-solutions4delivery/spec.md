# Spec: 1657 — Source Company Plugin: Solutions 4 Delivery

| Field | Value |
| --- | --- |
| Spec ID | 1657 |
| Slug | source-company-solutions4delivery |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-solutions4delivery` for **Solutions 4 Delivery** (SaaS platform for online food ordering and delivery aimed at quick-service restaurant chains.). Sector:
Food e-commerce / delivery SaaS. HQ: Amsterdam, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`s4d` (`https://s4d.recruitee.com`), which exposed
**13 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-solutions4delivery` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SOLUTIONS_4_DELIVERY`** in the source
> registry, so that a single `siteType: [Site.SOLUTIONS_4_DELIVERY]` request returns
> Solutions 4 Delivery's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SOLUTIONS_4_DELIVERY = 'solutions4delivery'` to the `Site` enum. | must |
| FR-2 | `Solutions4DeliveryService` implements `IScraper`, `@SourcePlugin({ site: Site.SOLUTIONS_4_DELIVERY, name: 'Solutions 4 Delivery', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 's4d' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SOLUTIONS_4_DELIVERY`, `companyName = 'Solutions 4 Delivery'`, `id` prefix `recruitee-`→`solutions4delivery-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board (slug s4d, reached via a redirect from solutions4delivery) with 10 live offers.
- SaaS ordering/delivery platform for QSR chains.
- All open roles Amsterdam-based across Operations, Growth and Product.
