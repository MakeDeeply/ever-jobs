# Spec: 1308 — Source Company Plugin: N-Power Medicine

| Field | Value |
| --- | --- |
| Spec ID | 1308 |
| Slug | source-company-npowermedicine |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-npowermedicine` for
**N-Power Medicine** (Reinvents clinical trials with data science and large language model operations.). Sector: Applied AI / clinical research. HQ: Redwood City, California, USA.

The company's live postings are served by **Lever** on job board
`npowermedicine` (`https://jobs.lever.co/npowermedicine`), which exposed
**8 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-npowermedicine` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.N_POWER_MEDICINE`** in the source
> registry, so that a single `siteType: [Site.N_POWER_MEDICINE]` request returns
> N-Power Medicine's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.N_POWER_MEDICINE = 'npowermedicine'` to the `Site` enum. | must |
| FR-2 | `NPowerMedicineService` implements `IScraper`, `@SourcePlugin({ site: Site.N_POWER_MEDICINE, name: 'N-Power Medicine', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'npowermedicine' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.N_POWER_MEDICINE`, `companyName = 'N-Power Medicine'`, `id` prefix `lever-`→`npowermedicine-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Integrates clinical trials with clinical practice
- Hires LLM operations and clinical data science roles
- Locations in Redwood City and Los Gatos, CA
- Focused on drug development workflows
