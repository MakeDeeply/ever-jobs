# Spec: 1202 — Source Company Plugin: Aqemia

| Field | Value |
| --- | --- |
| Spec ID | 1202 |
| Slug | source-company-aqemiacom |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-aqemiacom` for
**Aqemia** (Fuses quantum-inspired physics algorithms with generative AI for drug discovery.). Sector: Applied AI / drug discovery. HQ: Paris, Ile-de-France, France.

The company's live postings are served by **Lever** on job board
`aqemia.com` (`https://jobs.lever.co/aqemia.com`), which exposed
**12 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-aqemiacom` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.AQEMIA`** in the source
> registry, so that a single `siteType: [Site.AQEMIA]` request returns
> Aqemia's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.AQEMIA = 'aqemiacom'` to the `Site` enum. | must |
| FR-2 | `AqemiaService` implements `IScraper`, `@SourcePlugin({ site: Site.AQEMIA, name: 'Aqemia', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'aqemia.com' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.AQEMIA`, `companyName = 'Aqemia'`, `id` prefix `lever-`→`aqemiacom-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Combines quantum-inspired physics with generative AI for drug design
- Platform and drug-discovery-program teams
- Roles include applied AI science and AI R&D management
- Offices in Paris and London
