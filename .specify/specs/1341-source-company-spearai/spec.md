# Spec: 1341 — Source Company Plugin: Spear AI

| Field | Value |
| --- | --- |
| Spec ID | 1341 |
| Slug | source-company-spearai |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-spearai` for
**Spear AI** (Applies AI and machine learning to defense and intelligence mission data.). Sector: Applied AI / defense and intelligence. HQ: Washington, District of Columbia, USA.

The company's live postings are served by **Lever** on job board
`spear-ai` (`https://jobs.lever.co/spear-ai`), which exposed
**11 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-spearai` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SPEAR_AI`** in the source
> registry, so that a single `siteType: [Site.SPEAR_AI]` request returns
> Spear AI's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SPEAR_AI = 'spearai'` to the `Site` enum. | must |
| FR-2 | `SpearAIService` implements `IScraper`, `@SourcePlugin({ site: Site.SPEAR_AI, name: 'Spear AI', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'spear-ai' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SPEAR_AI`, `companyName = 'Spear AI'`, `id` prefix `lever-`→`spearai-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Delivers AI/ML mission and data engineering for defense customers
- Roles include mission engineering, data engineering and cybersecurity
- Work based at Bolling AFB, Washington, D.C.
- Serves intelligence-community missions
