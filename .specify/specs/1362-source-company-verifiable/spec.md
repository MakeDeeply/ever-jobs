# Spec: 1362 — Source Company Plugin: Verifiable

| Field | Value |
| --- | --- |
| Spec ID | 1362 |
| Slug | source-company-verifiable |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-verifiable` for
**Verifiable** (AI, API, and software platform for healthcare provider credentialing and network monitoring.). Sector: Healthcare API / SaaS platform. HQ: United States (remote-first).

The company's live postings are served by **Lever** on job board
`verifiable` (`https://jobs.lever.co/verifiable`), which exposed
**6 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-verifiable` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.VERIFIABLE`** in the source
> registry, so that a single `siteType: [Site.VERIFIABLE]` request returns
> Verifiable's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.VERIFIABLE = 'verifiable'` to the `Site` enum. | must |
| FR-2 | `VerifiableService` implements `IScraper`, `@SourcePlugin({ site: Site.VERIFIABLE, name: 'Verifiable', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'verifiable' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.VERIFIABLE`, `companyName = 'Verifiable'`, `id` prefix `lever-`→`verifiable-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- API-first credentialing and network-monitoring platform
- Engineering roles include Software Engineer III - API
- Fully remote across the US and internationally
