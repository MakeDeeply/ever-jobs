# Spec: 1247 — Source Company Plugin: Evident

| Field | Value |
| --- | --- |
| Spec ID | 1247 |
| Slug | source-company-evidentid |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-evidentid` for
**Evident** (Enterprise platform, accessible via web portal or API, for automated third-party insurance and credential verification.). Sector: Identity / verification API platform. HQ: Atlanta, Georgia, United States.

The company's live postings are served by **Lever** on job board
`evidentid` (`https://jobs.lever.co/evidentid`), which exposed
**7 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-evidentid` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.EVIDENT`** in the source
> registry, so that a single `siteType: [Site.EVIDENT]` request returns
> Evident's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.EVIDENT = 'evidentid'` to the `Site` enum. | must |
| FR-2 | `EvidentService` implements `IScraper`, `@SourcePlugin({ site: Site.EVIDENT, name: 'Evident', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'evidentid' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.EVIDENT`, `companyName = 'Evident'`, `id` prefix `lever-`→`evidentid-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Configurable API and web platform for credential and insurance verification
- Targets Risk, Procurement, and Operations teams
- Postings include Senior Full Stack Software Engineer roles in Atlanta
