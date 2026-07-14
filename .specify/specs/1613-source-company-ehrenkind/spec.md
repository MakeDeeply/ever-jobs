# Spec: 1613 — Source Company Plugin: Ehrenkind

| Field | Value |
| --- | --- |
| Spec ID | 1613 |
| Slug | source-company-ehrenkind |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-ehrenkind` for **Ehrenkind** (German e-commerce brand selling its products via online marketplaces including Amazon and Otto.). Sector:
E-commerce / marketplace seller (consumer brand). HQ: Schwäbisch Hall, Germany.

The company's live postings are served by **Recruitee** on subdomain
`ehrenkindgmbh` (`https://ehrenkindgmbh.recruitee.com`), which exposed
**3 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-ehrenkind` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.EHRENKIND`** in the source
> registry, so that a single `siteType: [Site.EHRENKIND]` request returns
> Ehrenkind's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.EHRENKIND = 'ehrenkind'` to the `Site` enum. | must |
| FR-2 | `EhrenkindService` implements `IScraper`, `@SourcePlugin({ site: Site.EHRENKIND, name: 'Ehrenkind', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ehrenkindgmbh' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.EHRENKIND`, `companyName = 'Ehrenkind'`, `id` prefix `recruitee-`→`ehrenkind-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified board ehrenkindgmbh.recruitee.com/api/offers returned an offers array with 3 entries
- Headquartered in Schwäbisch Hall, Baden-Württemberg (with a warehouse in Heiden, NRW)
- Sells via online marketplaces including Amazon and Otto
- Roles include marketplace management and warehouse logistics
