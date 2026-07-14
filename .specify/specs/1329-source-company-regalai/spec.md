# Spec: 1329 — Source Company Plugin: Regal

| Field | Value |
| --- | --- |
| Spec ID | 1329 |
| Slug | source-company-regalai |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-regalai` for
**Regal** (Builds AI voice agents for customer contact and sales operations.). Sector: Applied AI / voice agents. HQ: New York, New York, USA.

The company's live postings are served by **Lever** on job board
`regal.ai` (`https://jobs.lever.co/regal.ai`), which exposed
**13 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-regalai` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.REGAL`** in the source
> registry, so that a single `siteType: [Site.REGAL]` request returns
> Regal's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.REGAL = 'regalai'` to the `Site` enum. | must |
| FR-2 | `RegalService` implements `IScraper`, `@SourcePlugin({ site: Site.REGAL, name: 'Regal', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'regal.ai' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.REGAL`, `companyName = 'Regal'`, `id` prefix `lever-`→`regalai-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Builds production AI voice agents
- Forward Deployed Engineering roles bring voice agents to production
- Roles span AI product, analytics and engineering
- Headquartered in New York
