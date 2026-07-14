# Spec: 1111 — Source Company Plugin: Netspend

| Field | Value |
| --- | --- |
| Spec ID | 1111 |
| Slug | source-company-netspend |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-netspend` for
**Netspend** (A provider of prepaid and debit card financial services for consumers.). Sector: Fintech - Prepaid & debit cards. HQ: Austin, Texas, USA.

The company's live postings are served by **Ashby** on job board
`netspend-careers-page` (`https://jobs.ashbyhq.com/netspend-careers-page`), which exposed
**13 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-netspend` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NETSPEND`** in the source
> registry, so that a single `siteType: [Site.NETSPEND]` request returns
> Netspend's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NETSPEND = 'netspend'` to the `Site` enum. | must |
| FR-2 | `NetspendService` implements `IScraper`, `@SourcePlugin({ site: Site.NETSPEND, name: 'Netspend', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'netspend-careers-page' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NETSPEND`, `companyName = 'Netspend'`, `id` prefix `ashby-`→`netspend-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Prepaid and debit card financial products
- Serves consumers including the underbanked
- Manages debit and prepaid card portfolios
