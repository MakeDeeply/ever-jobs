# Spec: 1640 — Source Company Plugin: Natuvion

| Field | Value |
| --- | --- |
| Spec ID | 1640 |
| Slug | source-company-natuvion |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-natuvion` for **Natuvion** (Software and services for migrating business-critical data and processes between platforms.). Sector:
Enterprise software / SAP services. HQ: Walldorf, Germany.

The company's live postings are served by **Recruitee** on subdomain
`natuvion` (`https://natuvion.recruitee.com`), which exposed
**64 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-natuvion` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NATUVION`** in the source
> registry, so that a single `siteType: [Site.NATUVION]` request returns
> Natuvion's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NATUVION = 'natuvion'` to the `Site` enum. | must |
| FR-2 | `NatuvionService` implements `IScraper`, `@SourcePlugin({ site: Site.NATUVION, name: 'Natuvion', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'natuvion' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NATUVION`, `companyName = 'Natuvion'`, `id` prefix `recruitee-`→`natuvion-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board at natuvion.recruitee.com with 5 open offers
- Specializes in SAP migration and transformation
- Roles across consulting and technical delivery in Germany and Argentina
