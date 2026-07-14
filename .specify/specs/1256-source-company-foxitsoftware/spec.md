# Spec: 1256 — Source Company Plugin: Foxit

| Field | Value |
| --- | --- |
| Spec ID | 1256 |
| Slug | source-company-foxitsoftware |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-foxitsoftware` for
**Foxit** (PDF and document productivity software for individuals and enterprises.). Sector: B2B SaaS / Document Productivity. HQ: Fremont, California, United States.

The company's live postings are served by **Lever** on job board
`foxitsoftware` (`https://jobs.lever.co/foxitsoftware`), which exposed
**13 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-foxitsoftware` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FOXIT`** in the source
> registry, so that a single `siteType: [Site.FOXIT]` request returns
> Foxit's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FOXIT = 'foxitsoftware'` to the `Site` enum. | must |
| FR-2 | `FoxitService` implements `IScraper`, `@SourcePlugin({ site: Site.FOXIT, name: 'Foxit', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'foxitsoftware' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FOXIT`, `companyName = 'Foxit'`, `id` prefix `lever-`→`foxitsoftware-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- PDF editing and document management software
- Teams in Alpharetta, Georgia and Dublin, Ireland
- Roles across data engineering and global IT
