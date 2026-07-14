# Spec: 1318 — Source Company Plugin: Paytm

| Field | Value |
| --- | --- |
| Spec ID | 1318 |
| Slug | source-company-paytm |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-paytm` for
**Paytm** (India's mobile payments and financial-services distribution platform.). Sector: Payments / Fintech. HQ: Noida, Uttar Pradesh, India.

The company's live postings are served by **Lever** on job board
`paytm` (`https://jobs.lever.co/paytm`), which exposed
**230 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-paytm` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PAYTM`** in the source
> registry, so that a single `siteType: [Site.PAYTM]` request returns
> Paytm's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PAYTM = 'paytm'` to the `Site` enum. | must |
| FR-2 | `PaytmService` implements `IScraper`, `@SourcePlugin({ site: Site.PAYTM, name: 'Paytm', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'paytm' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PAYTM`, `companyName = 'Paytm'`, `id` prefix `lever-`→`paytm-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- 500M+ registered users.
- Operations across Noida, Bangalore, Gurugram, and Mumbai.
- Expanding internationally including a presence in Dubai.
