# Spec: 1334 — Source Company Plugin: Salvo Health

| Field | Value |
| --- | --- |
| Spec ID | 1334 |
| Slug | source-company-salvohealth |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-salvohealth` for
**Salvo Health** (Virtual specialty care company focused on chronic digestive and gastrointestinal conditions.). Sector: Digital Health. HQ: New York, New York, USA.

The company's live postings are served by **Lever** on job board
`salvohealth` (`https://jobs.lever.co/salvohealth`), which exposed
**8 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-salvohealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SALVO_HEALTH`** in the source
> registry, so that a single `siteType: [Site.SALVO_HEALTH]` request returns
> Salvo Health's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SALVO_HEALTH = 'salvohealth'` to the `Site` enum. | must |
| FR-2 | `SalvoHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.SALVO_HEALTH, name: 'Salvo Health', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'salvohealth' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SALVO_HEALTH`, `companyName = 'Salvo Health'`, `id` prefix `lever-`→`salvohealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Virtual care for chronic GI conditions
- Team-based model with dietitians and health coaches
- Partners with gastroenterology providers
