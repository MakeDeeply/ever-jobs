# Spec: 1338 — Source Company Plugin: Smile Digital Health

| Field | Value |
| --- | --- |
| Spec ID | 1338 |
| Slug | source-company-smiledigitalhealth |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-smiledigitalhealth` for
**Smile Digital Health** (Health data platform and FHIR-based clinical data repository for healthcare interoperability.). Sector: Health Tech / Interoperability. HQ: Toronto, Ontario, Canada.

The company's live postings are served by **Lever** on job board
`smiledigitalhealth` (`https://jobs.lever.co/smiledigitalhealth`), which exposed
**8 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-smiledigitalhealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SMILE_DIGITAL_HEALTH`** in the source
> registry, so that a single `siteType: [Site.SMILE_DIGITAL_HEALTH]` request returns
> Smile Digital Health's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SMILE_DIGITAL_HEALTH = 'smiledigitalhealth'` to the `Site` enum. | must |
| FR-2 | `SmileDigitalHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.SMILE_DIGITAL_HEALTH, name: 'Smile Digital Health', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'smiledigitalhealth' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SMILE_DIGITAL_HEALTH`, `companyName = 'Smile Digital Health'`, `id` prefix `lever-`→`smiledigitalhealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Built on the HL7 FHIR interoperability standard
- Provides a clinical data repository and health data platform
- Serves payers, providers, and life-sciences customers
