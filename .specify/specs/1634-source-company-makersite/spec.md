# Spec: 1634 — Source Company Plugin: Makersite

| Field | Value |
| --- | --- |
| Spec ID | 1634 |
| Slug | source-company-makersite |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-makersite` for **Makersite** (Product lifecycle and sustainability data platform for supply-chain decisions.). Sector:
Sustainability / PLM SaaS. HQ: Stuttgart, Germany.

The company's live postings are served by **Recruitee** on subdomain
`makersitegmbh` (`https://makersitegmbh.recruitee.com`), which exposed
**7 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-makersite` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MAKERSITE`** in the source
> registry, so that a single `siteType: [Site.MAKERSITE]` request returns
> Makersite's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MAKERSITE = 'makersite'` to the `Site` enum. | must |
| FR-2 | `MakersiteService` implements `IScraper`, `@SourcePlugin({ site: Site.MAKERSITE, name: 'Makersite', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'makersitegmbh' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MAKERSITE`, `companyName = 'Makersite'`, `id` prefix `recruitee-`→`makersite-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board at makersitegmbh.recruitee.com with 3 open offers
- Data-science and LLM-oriented engineering roles
- Offices in Stuttgart and Berlin, remote-first
