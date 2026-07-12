# Spec: 1250 — Source Company Plugin: Field Nation

| Field | Value |
| --- | --- |
| Spec ID | 1250 |
| Slug | source-company-fieldnation |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-fieldnation` for
**Field Nation** (Marketplace and workforce management platform connecting businesses with field service technicians.). Sector: B2B SaaS / Field Service Management. HQ: Minneapolis, Minnesota, United States.

The company's live postings are served by **Lever** on job board
`fieldnation` (`https://jobs.lever.co/fieldnation`), which exposed
**18 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-fieldnation` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FIELD_NATION`** in the source
> registry, so that a single `siteType: [Site.FIELD_NATION]` request returns
> Field Nation's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FIELD_NATION = 'fieldnation'` to the `Site` enum. | must |
| FR-2 | `FieldNationService` implements `IScraper`, `@SourcePlugin({ site: Site.FIELD_NATION, name: 'Field Nation', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'fieldnation' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FIELD_NATION`, `companyName = 'Field Nation'`, `id` prefix `lever-`→`fieldnation-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Combines a field-service marketplace with workforce software
- Teams in Minnesota, United States and Dhaka, Bangladesh
- Roles across marketing, business development, and content
