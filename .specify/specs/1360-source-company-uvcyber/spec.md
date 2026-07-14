# Spec: 1360 — Source Company Plugin: UltraViolet Cyber

| Field | Value |
| --- | --- |
| Spec ID | 1360 |
| Slug | source-company-uvcyber |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-uvcyber` for
**UltraViolet Cyber** (Platform-enabled unified security operations company providing managed detection, response, and offensive security services.). Sector: Cybersecurity (Managed Security / Security Operations). HQ: McLean, Virginia, United States.

The company's live postings are served by **Lever** on job board
`uvcyber` (`https://jobs.lever.co/uvcyber`), which exposed
**25 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-uvcyber` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ULTRAVIOLET_CYBER`** in the source
> registry, so that a single `siteType: [Site.ULTRAVIOLET_CYBER]` request returns
> UltraViolet Cyber's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ULTRAVIOLET_CYBER = 'uvcyber'` to the `Site` enum. | must |
| FR-2 | `UltraVioletCyberService` implements `IScraper`, `@SourcePlugin({ site: Site.ULTRAVIOLET_CYBER, name: 'UltraViolet Cyber', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'uvcyber' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ULTRAVIOLET_CYBER`, `companyName = 'UltraViolet Cyber'`, `id` prefix `lever-`→`uvcyber-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Unified security operations spanning offensive and defensive security
- Threat Intelligence & Detection Engineering (TIDE) team
- Managed detection and response plus red-team/pentest services
- Practitioner-founded and operated
