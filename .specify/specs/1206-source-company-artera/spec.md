# Spec: 1206 — Source Company Plugin: Artera

| Field | Value |
| --- | --- |
| Spec ID | 1206 |
| Slug | source-company-artera |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-artera` for
**Artera** (Develops AI-based medical tests to personalize cancer therapy decisions.). Sector: Applied AI / healthcare. HQ: Los Altos, California, USA.

The company's live postings are served by **Lever** on job board
`artera` (`https://jobs.lever.co/artera`), which exposed
**12 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-artera` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ARTERA`** in the source
> registry, so that a single `siteType: [Site.ARTERA]` request returns
> Artera's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ARTERA = 'artera'` to the `Site` enum. | must |
| FR-2 | `ArteraService` implements `IScraper`, `@SourcePlugin({ site: Site.ARTERA, name: 'Artera', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'artera' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ARTERA`, `companyName = 'Artera'`, `id` prefix `lever-`→`artera-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Builds AI-based medical tests for cancer therapy personalization
- Maintains ML compute infrastructure and core libraries for AI scientists
- Roles span platform ML and clinical sales
- Headquartered in the San Francisco Bay Area
