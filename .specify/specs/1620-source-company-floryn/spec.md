# Spec: 1620 — Source Company Plugin: Floryn

| Field | Value |
| --- | --- |
| Spec ID | 1620 |
| Slug | source-company-floryn |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-floryn` for **Floryn** (Dutch SME lending fintech providing business credit under De Nederlandsche Bank supervision with a PSD2 licence.). Sector:
SME lending / business finance. HQ: 's-Hertogenbosch, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`floryn` (`https://floryn.recruitee.com`), which exposed
**5 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-floryn` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FLORYN`** in the source
> registry, so that a single `siteType: [Site.FLORYN]` request returns
> Floryn's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FLORYN = 'floryn'` to the `Site` enum. | must |
| FR-2 | `FlorynService` implements `IScraper`, `@SourcePlugin({ site: Site.FLORYN, name: 'Floryn', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'floryn' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FLORYN`, `companyName = 'Floryn'`, `id` prefix `recruitee-`→`floryn-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Regulated by De Nederlandsche Bank; holds a PSD2 licence
- Recruitee board returned six live openings including analytics and full-stack engineering
- Canonical slug is floryn; invoicefinance redirects to it
