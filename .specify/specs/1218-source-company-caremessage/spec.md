# Spec: 1218 — Source Company Plugin: CareMessage

| Field | Value |
| --- | --- |
| Spec ID | 1218 |
| Slug | source-company-caremessage |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-caremessage` for
**CareMessage** (Nonprofit patient-engagement technology platform for safety-net healthcare organizations.). Sector: Health Tech. HQ: San Francisco, California, USA.

The company's live postings are served by **Lever** on job board
`caremessage` (`https://jobs.lever.co/caremessage`), which exposed
**5 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-caremessage` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CAREMESSAGE`** in the source
> registry, so that a single `siteType: [Site.CAREMESSAGE]` request returns
> CareMessage's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CAREMESSAGE = 'caremessage'` to the `Site` enum. | must |
| FR-2 | `CareMessageService` implements `IScraper`, `@SourcePlugin({ site: Site.CAREMESSAGE, name: 'CareMessage', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'caremessage' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CAREMESSAGE`, `companyName = 'CareMessage'`, `id` prefix `lever-`→`caremessage-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Nonprofit focused on health equity
- Text-messaging patient-engagement platform
- Serves safety-net healthcare providers
