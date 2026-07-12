# Spec: 1355 — Source Company Plugin: Trial Library

| Field | Value |
| --- | --- |
| Spec ID | 1355 |
| Slug | source-company-triallibrary |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-triallibrary` for
**Trial Library** (Platform expanding access to and diversity in oncology clinical trials.). Sector: Health Tech / Clinical Research. HQ: San Francisco, California, USA.

The company's live postings are served by **Lever** on job board
`triallibrary` (`https://jobs.lever.co/triallibrary`), which exposed
**3 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-triallibrary` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TRIAL_LIBRARY`** in the source
> registry, so that a single `siteType: [Site.TRIAL_LIBRARY]` request returns
> Trial Library's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TRIAL_LIBRARY = 'triallibrary'` to the `Site` enum. | must |
| FR-2 | `TrialLibraryService` implements `IScraper`, `@SourcePlugin({ site: Site.TRIAL_LIBRARY, name: 'Trial Library', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'triallibrary' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TRIAL_LIBRARY`, `companyName = 'Trial Library'`, `id` prefix `lever-`→`triallibrary-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Focused on oncology clinical-trial access
- Aims to improve trial diversity
- Connects patients and providers to precision-medicine studies
