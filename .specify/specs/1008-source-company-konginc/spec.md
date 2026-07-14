# Spec: 1008 — Source Company Plugin: Kong Inc.

| Field | Value |
| --- | --- |
| Spec ID | 1008 |
| Slug | source-company-konginc |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-konginc` for
**Kong Inc.** (Developer of cloud API management and connectivity technologies.). Sector: API infrastructure / Platform engineering. HQ: San Francisco, California, USA.

The company's live postings are served by **Ashby** on job board
`kong` (`https://jobs.ashbyhq.com/kong`), which exposed
**92 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-konginc` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.KONG_INC`** in the source
> registry, so that a single `siteType: [Site.KONG_INC]` request returns
> Kong Inc.'s live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.KONG_INC = 'konginc'` to the `Site` enum. | must |
| FR-2 | `KongIncService` implements `IScraper`, `@SourcePlugin({ site: Site.KONG_INC, name: 'Kong Inc.', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'kong' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.KONG_INC`, `companyName = 'Kong Inc.'`, `id` prefix `ashby-`→`konginc-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- API gateway and connectivity platform
- Open-source Kong Gateway core
- Serves startups through large enterprises
