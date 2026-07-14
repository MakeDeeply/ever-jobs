# Spec: 1231 — Source Company Plugin: Centre for Strategic Infocomm Technologies (CSIT)

| Field | Value |
| --- | --- |
| Spec ID | 1231 |
| Slug | source-company-csit |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-csit` for
**Centre for Strategic Infocomm Technologies (CSIT)** (Singapore government agency conducting cybersecurity R&D and building capabilities to defend against advanced cyber threats.). Sector: Cybersecurity (Government / National Security R&D). HQ: Singapore, Singapore.

The company's live postings are served by **Lever** on job board
`csit` (`https://jobs.lever.co/csit`), which exposed
**68 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-csit` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CENTRE_FOR_STRATEGIC_INFOCOMM_TECHNOLOGIES_CSIT`** in the source
> registry, so that a single `siteType: [Site.CENTRE_FOR_STRATEGIC_INFOCOMM_TECHNOLOGIES_CSIT]` request returns
> Centre for Strategic Infocomm Technologies (CSIT)'s live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CENTRE_FOR_STRATEGIC_INFOCOMM_TECHNOLOGIES_CSIT = 'csit'` to the `Site` enum. | must |
| FR-2 | `CentreForStrategicInfocommTechnologiesCSITService` implements `IScraper`, `@SourcePlugin({ site: Site.CENTRE_FOR_STRATEGIC_INFOCOMM_TECHNOLOGIES_CSIT, name: 'Centre for Strategic Infocomm Technologies (CSIT)', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'csit' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CENTRE_FOR_STRATEGIC_INFOCOMM_TECHNOLOGIES_CSIT`, `companyName = 'Centre for Strategic Infocomm Technologies (CSIT)'`, `id` prefix `lever-`→`csit-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- National-security cybersecurity R&D under Singapore's Ministry of Defence
- Vulnerability research and advanced cyber-threat defense
- Work spans cloud, enterprise, mobile, and critical infrastructure
- Large active hiring across engineering and security research
