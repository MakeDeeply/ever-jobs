# Spec: 1209 — Source Company Plugin: Avalere Health

| Field | Value |
| --- | --- |
| Spec ID | 1209 |
| Slug | source-company-avalerehealth |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-avalerehealth` for
**Avalere Health** (Health-focused advisory, medical communications, and marketing services group for life sciences.). Sector: Health Tech / Life Sciences Services. HQ: London, England, United Kingdom.

The company's live postings are served by **Lever** on job board
`avalerehealth` (`https://jobs.lever.co/avalerehealth`), which exposed
**28 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-avalerehealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.AVALERE_HEALTH`** in the source
> registry, so that a single `siteType: [Site.AVALERE_HEALTH]` request returns
> Avalere Health's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.AVALERE_HEALTH = 'avalerehealth'` to the `Site` enum. | must |
| FR-2 | `AvalereHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.AVALERE_HEALTH, name: 'Avalere Health', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'avalerehealth' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.AVALERE_HEALTH`, `companyName = 'Avalere Health'`, `id` prefix `lever-`→`avalerehealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Combines advisory, medical, and marketing services
- Serves pharmaceutical and life-sciences clients
- Operates as an integrated global health agency group
