# Spec: 1349 — Source Company Plugin: Sysdig

| Field | Value |
| --- | --- |
| Spec ID | 1349 |
| Slug | source-company-sysdig |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-sysdig` for
**Sysdig** (Cloud and container security company built on open-source Falco for runtime threat detection and CNAPP.). Sector: Cybersecurity (Cloud/Container Security). HQ: San Francisco, California, United States.

The company's live postings are served by **Lever** on job board
`sysdig` (`https://jobs.lever.co/sysdig`), which exposed
**6 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-sysdig` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SYSDIG`** in the source
> registry, so that a single `siteType: [Site.SYSDIG]` request returns
> Sysdig's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SYSDIG = 'sysdig'` to the `Site` enum. | must |
| FR-2 | `SysdigService` implements `IScraper`, `@SourcePlugin({ site: Site.SYSDIG, name: 'Sysdig', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'sysdig' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SYSDIG`, `companyName = 'Sysdig'`, `id` prefix `lever-`→`sysdig-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Creator of the open-source Falco runtime security project
- Cloud-native application protection platform (CNAPP)
- Runtime threat detection and container security focus
- Global engineering teams across the US and Italy
