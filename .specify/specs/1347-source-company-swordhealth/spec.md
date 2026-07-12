# Spec: 1347 — Source Company Plugin: Sword Health

| Field | Value |
| --- | --- |
| Spec ID | 1347 |
| Slug | source-company-swordhealth |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-swordhealth` for
**Sword Health** (AI-powered digital platform for musculoskeletal, pelvic, and mental health care.). Sector: Digital Health. HQ: New York, New York, USA.

The company's live postings are served by **Lever** on job board
`swordhealth` (`https://jobs.lever.co/swordhealth`), which exposed
**39 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-swordhealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SWORD_HEALTH`** in the source
> registry, so that a single `siteType: [Site.SWORD_HEALTH]` request returns
> Sword Health's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SWORD_HEALTH = 'swordhealth'` to the `Site` enum. | must |
| FR-2 | `SwordHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.SWORD_HEALTH, name: 'Sword Health', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'swordhealth' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SWORD_HEALTH`, `companyName = 'Sword Health'`, `id` prefix `lever-`→`swordhealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- AI-assisted virtual physical therapy programs
- Expanded into pelvic, women's, and mental health
- Sold primarily through employer and health-plan partnerships
