# Spec: 1236 — Source Company Plugin: Digital Media Management

| Field | Value |
| --- | --- |
| Spec ID | 1236 |
| Slug | source-company-digitalmediamanagement |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-digitalmediamanagement` for
**Digital Media Management** (Social media marketing agency serving entertainment clients.). Sector: media. HQ: Los Angeles, California, United States.

The company's live postings are served by **Lever** on job board
`digitalmediamanagement` (`https://jobs.lever.co/digitalmediamanagement`), which exposed
**10 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-digitalmediamanagement` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DIGITAL_MEDIA_MANAGEMENT`** in the source
> registry, so that a single `siteType: [Site.DIGITAL_MEDIA_MANAGEMENT]` request returns
> Digital Media Management's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DIGITAL_MEDIA_MANAGEMENT = 'digitalmediamanagement'` to the `Site` enum. | must |
| FR-2 | `DigitalMediaManagementService` implements `IScraper`, `@SourcePlugin({ site: Site.DIGITAL_MEDIA_MANAGEMENT, name: 'Digital Media Management', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'digitalmediamanagement' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DIGITAL_MEDIA_MANAGEMENT`, `companyName = 'Digital Media Management'`, `id` prefix `lever-`→`digitalmediamanagement-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Social media marketing agency for entertainment clients
- Part of Keywords Studios
- Hiring social media managers and project managers
