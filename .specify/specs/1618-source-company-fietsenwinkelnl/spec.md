# Spec: 1618 — Source Company Plugin: Fietsenwinkel.nl

| Field | Value |
| --- | --- |
| Spec ID | 1618 |
| Slug | source-company-fietsenwinkelnl |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-fietsenwinkelnl` for **Fietsenwinkel.nl** (Omnichannel e-bike and bicycle retailer combining an online shop with physical stores across the Netherlands.). Sector:
E-commerce retail (bicycles / e-bikes). HQ: Utrecht, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`fietsenwinkelnl` (`https://fietsenwinkelnl.recruitee.com`), which exposed
**26 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-fietsenwinkelnl` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FIETSENWINKEL_NL`** in the source
> registry, so that a single `siteType: [Site.FIETSENWINKEL_NL]` request returns
> Fietsenwinkel.nl's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FIETSENWINKEL_NL = 'fietsenwinkelnl'` to the `Site` enum. | must |
| FR-2 | `FietsenwinkelNlService` implements `IScraper`, `@SourcePlugin({ site: Site.FIETSENWINKEL_NL, name: 'Fietsenwinkel.nl', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'fietsenwinkelnl' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FIETSENWINKEL_NL`, `companyName = 'Fietsenwinkel.nl'`, `id` prefix `recruitee-`→`fietsenwinkelnl-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board with 7 live offers.
- Omnichannel model: online shop plus physical stores/megastore.
- Open roles spread across Utrecht, Amsterdam, Groningen and Zwolle.
