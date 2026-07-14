# Spec: 1049 — Source Company Plugin: Dash0

| Field | Value |
| --- | --- |
| Spec ID | 1049 |
| Slug | source-company-dash0 |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-dash0` for
**Dash0** (OpenTelemetry-native observability and monitoring platform.). Sector: Observability. HQ: Remote (EMEA-based).

The company's live postings are served by **Ashby** on job board
`dash0` (`https://jobs.ashbyhq.com/dash0`), which exposed
**36 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-dash0` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DASH0`** in the source
> registry, so that a single `siteType: [Site.DASH0]` request returns
> Dash0's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DASH0 = 'dash0'` to the `Site` enum. | must |
| FR-2 | `Dash0Service` implements `IScraper`, `@SourcePlugin({ site: Site.DASH0, name: 'Dash0', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'dash0' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DASH0`, `companyName = 'Dash0'`, `id` prefix `ashby-`→`dash0-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- OpenTelemetry-native observability platform
- Raised Series B funding
- Roles across Engineering, Sales, and Marketing in EMEA and US
