# Spec: 1655 — Source Company Plugin: QLF Brands (lampenlicht.nl)

| Field | Value |
| --- | --- |
| Spec ID | 1655 |
| Slug | source-company-qlfbrandslampenlichtnl |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-qlfbrandslampenlichtnl` for **QLF Brands (lampenlicht.nl)** (International e-commerce lighting retailer operating dozens of webshops (incl. lampenlicht.nl) plus physical stores across Europe.). Sector:
E-commerce retail (home / lighting). HQ: Hapert, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`qlfbrands` (`https://qlfbrands.recruitee.com`), which exposed
**19 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-qlfbrandslampenlichtnl` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.QLF_BRANDS_LAMPENLICHT_NL`** in the source
> registry, so that a single `siteType: [Site.QLF_BRANDS_LAMPENLICHT_NL]` request returns
> QLF Brands (lampenlicht.nl)'s live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.QLF_BRANDS_LAMPENLICHT_NL = 'qlfbrandslampenlichtnl'` to the `Site` enum. | must |
| FR-2 | `QLFBrandsLampenlichtNlService` implements `IScraper`, `@SourcePlugin({ site: Site.QLF_BRANDS_LAMPENLICHT_NL, name: 'QLF Brands (lampenlicht.nl)', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'qlfbrands' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.QLF_BRANDS_LAMPENLICHT_NL`, `companyName = 'QLF Brands (lampenlicht.nl)'`, `id` prefix `recruitee-`→`qlfbrandslampenlichtnl-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board with 7 live offers.
- Runs a large portfolio of European lighting webshops plus physical retail.
- Primary Dutch base in Hapert with additional European locations.
