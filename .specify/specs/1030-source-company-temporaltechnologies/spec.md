# Spec: 1030 — Source Company Plugin: Temporal Technologies

| Field | Value |
| --- | --- |
| Spec ID | 1030 |
| Slug | source-company-temporaltechnologies |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-temporaltechnologies` for
**Temporal Technologies** (Open-source durable execution platform that makes application code fault-tolerant.). Sector: Developer infrastructure / Workflow orchestration. HQ: Bellevue, Washington, USA.

The company's live postings are served by **Ashby** on job board
`temporal` (`https://jobs.ashbyhq.com/temporal`), which exposed
**54 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-temporaltechnologies` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TEMPORAL_TECHNOLOGIES`** in the source
> registry, so that a single `siteType: [Site.TEMPORAL_TECHNOLOGIES]` request returns
> Temporal Technologies's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TEMPORAL_TECHNOLOGIES = 'temporaltechnologies'` to the `Site` enum. | must |
| FR-2 | `TemporalTechnologiesService` implements `IScraper`, `@SourcePlugin({ site: Site.TEMPORAL_TECHNOLOGIES, name: 'Temporal Technologies', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'temporal' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TEMPORAL_TECHNOLOGIES`, `companyName = 'Temporal Technologies'`, `id` prefix `ashby-`→`temporaltechnologies-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Open-source durable execution engine
- Provides Temporal Cloud managed service
- Workflow-as-code programming model
