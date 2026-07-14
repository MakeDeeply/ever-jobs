# Spec: 1361 — Source Company Plugin: Venus Aerospace

| Field | Value |
| --- | --- |
| Spec ID | 1361 |
| Slug | source-company-venusaero |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-venusaero` for
**Venus Aerospace** (Develops rotating detonation rocket engines and high-speed propulsion systems.). Sector: Space/Aerospace. HQ: Houston, Texas, United States.

The company's live postings are served by **Lever** on job board
`venusaero` (`https://jobs.lever.co/venusaero`), which exposed
**15 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-venusaero` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.VENUS_AEROSPACE`** in the source
> registry, so that a single `siteType: [Site.VENUS_AEROSPACE]` request returns
> Venus Aerospace's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.VENUS_AEROSPACE = 'venusaero'` to the `Site` enum. | must |
| FR-2 | `VenusAerospaceService` implements `IScraper`, `@SourcePlugin({ site: Site.VENUS_AEROSPACE, name: 'Venus Aerospace', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'venusaero' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.VENUS_AEROSPACE`, `companyName = 'Venus Aerospace'`, `id` prefix `lever-`→`venusaero-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Developing rotating detonation rocket engine technology
- Focus on high-speed and hypersonic propulsion
- Hiring CNC programmers and manufacturing staff
