# Spec: 1207 — Source Company Plugin: ASAPP

| Field | Value |
| --- | --- |
| Spec ID | 1207 |
| Slug | source-company-asapp2 |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-asapp2` for
**ASAPP** (Builds real-time voice and generative AI for customer-experience operations.). Sector: Applied AI / conversational and speech AI. HQ: New York, New York, USA.

The company's live postings are served by **Lever** on job board
`asapp-2` (`https://jobs.lever.co/asapp-2`), which exposed
**10 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-asapp2` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ASAPP`** in the source
> registry, so that a single `siteType: [Site.ASAPP]` request returns
> ASAPP's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ASAPP = 'asapp2'` to the `Site` enum. | must |
| FR-2 | `ASAPPService` implements `IScraper`, `@SourcePlugin({ site: Site.ASAPP, name: 'ASAPP', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'asapp-2' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ASAPP`, `companyName = 'ASAPP'`, `id` prefix `lever-`→`asapp2-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Builds a real-time voice AI platform for customer experience
- Combines speech infrastructure with applied speech intelligence
- Roles span AI/ML engineering and IT leadership
- Offices in New York and Bangalore
