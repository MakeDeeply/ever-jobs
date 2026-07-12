# Spec: 1324 — Source Company Plugin: Quantum Metric

| Field | Value |
| --- | --- |
| Spec ID | 1324 |
| Slug | source-company-quantummetric |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-quantummetric` for
**Quantum Metric** (Continuous product and digital analytics platform for monitoring and optimizing digital journeys.). Sector: Digital / product analytics. HQ: Colorado Springs, Colorado, United States.

The company's live postings are served by **Lever** on job board
`quantummetric` (`https://jobs.lever.co/quantummetric`), which exposed
**9 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-quantummetric` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.QUANTUM_METRIC`** in the source
> registry, so that a single `siteType: [Site.QUANTUM_METRIC]` request returns
> Quantum Metric's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.QUANTUM_METRIC = 'quantummetric'` to the `Site` enum. | must |
| FR-2 | `QuantumMetricService` implements `IScraper`, `@SourcePlugin({ site: Site.QUANTUM_METRIC, name: 'Quantum Metric', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'quantummetric' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.QUANTUM_METRIC`, `companyName = 'Quantum Metric'`, `id` prefix `lever-`→`quantummetric-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Digital analytics platform focused on monitoring and optimizing web/app journeys.
- Serves retail, telco, and other enterprise verticals.
- Hiring solutions engineering and voice-of-customer roles.
