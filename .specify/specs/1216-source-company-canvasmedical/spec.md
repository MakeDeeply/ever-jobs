# Spec: 1216 — Source Company Plugin: Canvas Medical

| Field | Value |
| --- | --- |
| Spec ID | 1216 |
| Slug | source-company-canvasmedical |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-canvasmedical` for
**Canvas Medical** (Builds an EHR platform with AI agents that automate clinical and administrative work.). Sector: Applied AI / healthcare software. HQ: San Francisco, California, USA.

The company's live postings are served by **Lever** on job board
`canvasmedical` (`https://jobs.lever.co/canvasmedical`), which exposed
**6 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-canvasmedical` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CANVAS_MEDICAL`** in the source
> registry, so that a single `siteType: [Site.CANVAS_MEDICAL]` request returns
> Canvas Medical's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CANVAS_MEDICAL = 'canvasmedical'` to the `Site` enum. | must |
| FR-2 | `CanvasMedicalService` implements `IScraper`, `@SourcePlugin({ site: Site.CANVAS_MEDICAL, name: 'Canvas Medical', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'canvasmedical' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CANVAS_MEDICAL`, `companyName = 'Canvas Medical'`, `id` prefix `lever-`→`canvasmedical-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Provides an EHR platform with embedded AI agents
- Applied AI roles run agent evaluations pre- and post-deployment
- Hybrid San Francisco and remote roles
- Serves healthcare providers
