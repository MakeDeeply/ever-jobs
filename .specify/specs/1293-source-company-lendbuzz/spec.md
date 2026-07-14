# Spec: 1293 — Source Company Plugin: Lendbuzz

| Field | Value |
| --- | --- |
| Spec ID | 1293 |
| Slug | source-company-lendbuzz |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-lendbuzz` for
**Lendbuzz** (AI-based auto lending platform financing consumers through dealerships.). Sector: Auto Lending / Fintech. HQ: Boston, Massachusetts, United States.

The company's live postings are served by **Lever** on job board
`lendbuzz` (`https://jobs.lever.co/lendbuzz`), which exposed
**62 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-lendbuzz` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LENDBUZZ`** in the source
> registry, so that a single `siteType: [Site.LENDBUZZ]` request returns
> Lendbuzz's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LENDBUZZ = 'lendbuzz'` to the `Site` enum. | must |
| FR-2 | `LendbuzzService` implements `IScraper`, `@SourcePlugin({ site: Site.LENDBUZZ, name: 'Lendbuzz', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'lendbuzz' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LENDBUZZ`, `companyName = 'Lendbuzz'`, `id` prefix `lever-`→`lendbuzz-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Boston-headquartered auto finance fintech.
- Won a Fintech Breakthrough award for Best Consumer Lending Platform (2023).
- Surpassed one million loan applications in 2024.
