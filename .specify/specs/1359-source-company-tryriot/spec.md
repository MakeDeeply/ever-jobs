# Spec: 1359 — Source Company Plugin: RIOT

| Field | Value |
| --- | --- |
| Spec ID | 1359 |
| Slug | source-company-tryriot |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-tryriot` for
**RIOT** (Security awareness platform delivering short chat-based training, phishing simulations, and employee-facing security tools.). Sector: Cybersecurity (Security Awareness / Human Risk). HQ: Paris, France.

The company's live postings are served by **Lever** on job board
`tryriot` (`https://jobs.lever.co/tryriot`), which exposed
**20 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-tryriot` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.RIOT`** in the source
> registry, so that a single `siteType: [Site.RIOT]` request returns
> RIOT's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.RIOT = 'tryriot'` to the `Site` enum. | must |
| FR-2 | `RIOTService` implements `IScraper`, `@SourcePlugin({ site: Site.RIOT, name: 'RIOT', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'tryriot' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.RIOT`, `companyName = 'RIOT'`, `id` prefix `lever-`→`tryriot-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Chat-based micro-training plus phishing simulation
- Additional products including email filtering and DLP
- Founded 2020; reported to have raised around $45M
- Serves 2,000+ organizations globally
