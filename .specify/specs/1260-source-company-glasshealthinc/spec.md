# Spec: 1260 — Source Company Plugin: Glass Health

| Field | Value |
| --- | --- |
| Spec ID | 1260 |
| Slug | source-company-glasshealthinc |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-glasshealthinc` for
**Glass Health** (Clinical decision support platform applying AI for physicians.). Sector: Health Tech / Clinical AI. HQ: San Francisco, California, USA.

The company's live postings are served by **Lever** on job board
`glass-health-inc` (`https://jobs.lever.co/glass-health-inc`), which exposed
**4 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-glasshealthinc` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.GLASS_HEALTH`** in the source
> registry, so that a single `siteType: [Site.GLASS_HEALTH]` request returns
> Glass Health's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.GLASS_HEALTH = 'glasshealthinc'` to the `Site` enum. | must |
| FR-2 | `GlassHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.GLASS_HEALTH, name: 'Glass Health', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'glass-health-inc' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.GLASS_HEALTH`, `companyName = 'Glass Health'`, `id` prefix `lever-`→`glasshealthinc-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- AI clinical decision support for physicians
- Physician co-founded
- Focused on diagnosis and clinical planning
