# Spec: 1298 — Source Company Plugin: Magnopus

| Field | Value |
| --- | --- |
| Spec ID | 1298 |
| Slug | source-company-magnopus |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-magnopus` for
**Magnopus** (Creative technology studio working on virtual production, VFX and immersive experiences.). Sector: media. HQ: Los Angeles, California, United States.

The company's live postings are served by **Lever** on job board
`magnopus` (`https://jobs.lever.co/magnopus`), which exposed
**3 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-magnopus` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MAGNOPUS`** in the source
> registry, so that a single `siteType: [Site.MAGNOPUS]` request returns
> Magnopus's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MAGNOPUS = 'magnopus'` to the `Site` enum. | must |
| FR-2 | `MagnopusService` implements `IScraper`, `@SourcePlugin({ site: Site.MAGNOPUS, name: 'Magnopus', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'magnopus' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MAGNOPUS`, `companyName = 'Magnopus'`, `id` prefix `lever-`→`magnopus-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Works on virtual production and immersive experiences
- Blends filmmaking with real-time technology
- Hiring producers and technical artists
