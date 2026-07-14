# Spec: 1332 — Source Company Plugin: Revinate

| Field | Value |
| --- | --- |
| Spec ID | 1332 |
| Slug | source-company-revinate |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-revinate` for
**Revinate** (Hospitality customer data platform that unifies and analyzes hotel guest data.). Sector: Customer data platform (CDP). HQ: San Francisco, California, United States.

The company's live postings are served by **Lever** on job board
`revinate` (`https://jobs.lever.co/revinate`), which exposed
**5 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-revinate` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.REVINATE`** in the source
> registry, so that a single `siteType: [Site.REVINATE]` request returns
> Revinate's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.REVINATE = 'revinate'` to the `Site` enum. | must |
| FR-2 | `RevinateService` implements `IScraper`, `@SourcePlugin({ site: Site.REVINATE, name: 'Revinate', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'revinate' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.REVINATE`, `companyName = 'Revinate'`, `id` prefix `lever-`→`revinate-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- CDP that unifies hotel guest profiles at scale for hospitality operators.
- Manages over a billion guest profiles across thousands of hotels.
- Postings include data warehouse engineering and market intelligence roles.
