# Spec: 1317 — Source Company Plugin: PayJoy

| Field | Value |
| --- | --- |
| Spec ID | 1317 |
| Slug | source-company-payjoy |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-payjoy` for
**PayJoy** (Point-of-sale financing and credit provider for under-served customers in emerging markets.). Sector: Consumer Lending / Fintech. HQ: San Francisco, California, United States.

The company's live postings are served by **Lever** on job board
`payjoy` (`https://jobs.lever.co/payjoy`), which exposed
**63 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-payjoy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PAYJOY`** in the source
> registry, so that a single `siteType: [Site.PAYJOY]` request returns
> PayJoy's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PAYJOY = 'payjoy'` to the `Site` enum. | must |
| FR-2 | `PayJoyService` implements `IScraper`, `@SourcePlugin({ site: Site.PAYJOY, name: 'PayJoy', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'payjoy' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PAYJOY`, `companyName = 'PayJoy'`, `id` prefix `lever-`→`payjoy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Served over 18 million customers as of 2025.
- Operates across Mexico, Brazil, Colombia, Indonesia, South Africa, and the Philippines.
- Focused on financial inclusion in emerging markets.
