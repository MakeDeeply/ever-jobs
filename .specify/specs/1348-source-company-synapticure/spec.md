# Spec: 1348 — Source Company Plugin: Synapticure

| Field | Value |
| --- | --- |
| Spec ID | 1348 |
| Slug | source-company-synapticure |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-synapticure` for
**Synapticure** (Virtual care platform for neurodegenerative diseases such as ALS, Parkinson's, and Alzheimer's.). Sector: Digital Health. HQ: Chicago, Illinois, USA.

The company's live postings are served by **Lever** on job board
`synapticure` (`https://jobs.lever.co/synapticure`), which exposed
**3 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-synapticure` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SYNAPTICURE`** in the source
> registry, so that a single `siteType: [Site.SYNAPTICURE]` request returns
> Synapticure's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SYNAPTICURE = 'synapticure'` to the `Site` enum. | must |
| FR-2 | `SynapticureService` implements `IScraper`, `@SourcePlugin({ site: Site.SYNAPTICURE, name: 'Synapticure', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'synapticure' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SYNAPTICURE`, `companyName = 'Synapticure'`, `id` prefix `lever-`→`synapticure-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Specialty telehealth for neurodegenerative diseases
- Patient- and caregiver-founded
- Connects patients to neurologists and clinical trials
