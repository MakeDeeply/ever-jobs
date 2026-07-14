# Spec: 1327 — Source Company Plugin: Red Canyon Engineering & Software

| Field | Value |
| --- | --- |
| Spec ID | 1327 |
| Slug | source-company-redcanyonsoftware |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-redcanyonsoftware` for
**Red Canyon Engineering & Software** (Aerospace engineering and flight software services for space missions.). Sector: Space/Aerospace. HQ: Denver, Colorado, United States.

The company's live postings are served by **Lever** on job board
`redcanyonsoftware` (`https://jobs.lever.co/redcanyonsoftware`), which exposed
**9 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-redcanyonsoftware` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.RED_CANYON_ENGINEERING_SOFTWARE`** in the source
> registry, so that a single `siteType: [Site.RED_CANYON_ENGINEERING_SOFTWARE]` request returns
> Red Canyon Engineering & Software's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.RED_CANYON_ENGINEERING_SOFTWARE = 'redcanyonsoftware'` to the `Site` enum. | must |
| FR-2 | `RedCanyonEngineeringSoftwareService` implements `IScraper`, `@SourcePlugin({ site: Site.RED_CANYON_ENGINEERING_SOFTWARE, name: 'Red Canyon Engineering & Software', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'redcanyonsoftware' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.RED_CANYON_ENGINEERING_SOFTWARE`, `companyName = 'Red Canyon Engineering & Software'`, `id` prefix `lever-`→`redcanyonsoftware-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Flight software and systems engineering for space missions
- Supports spacecraft navigation and avionics
- Hiring flight software and navigation engineers
