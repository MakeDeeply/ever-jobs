# Spec: 1110 — Source Company Plugin: Mintlify

| Field | Value |
| --- | --- |
| Spec ID | 1110 |
| Slug | source-company-mintlify |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-mintlify` for
**Mintlify** (Platform for building and hosting developer and API documentation.). Sector: Developer tools / Documentation. HQ: San Francisco, California, USA.

The company's live postings are served by **Ashby** on job board
`mintlify` (`https://jobs.ashbyhq.com/mintlify`), which exposed
**13 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-mintlify` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MINTLIFY`** in the source
> registry, so that a single `siteType: [Site.MINTLIFY]` request returns
> Mintlify's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MINTLIFY = 'mintlify'` to the `Site` enum. | must |
| FR-2 | `MintlifyService` implements `IScraper`, `@SourcePlugin({ site: Site.MINTLIFY, name: 'Mintlify', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'mintlify' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MINTLIFY`, `companyName = 'Mintlify'`, `id` prefix `ashby-`→`mintlify-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Developer and API documentation platform
- Used by software and API companies
- Hosted documentation sites
