# Spec: 1585 — Source Company Plugin: Western Digital

| Field | Value |
| --- | --- |
| Spec ID | 1585 |
| Slug | source-company-westerndigital |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-westerndigital` for **Western Digital** (Manufacturer of data storage devices and solutions.). Sector:
Data storage technology / hardware. HQ: San Jose, California, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `WesternDigital` (`https://jobs.smartrecruiters.com/WesternDigital`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-westerndigital` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.WESTERN_DIGITAL`** in the source
> registry, so that a single `siteType: [Site.WESTERN_DIGITAL]` request returns
> Western Digital's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.WESTERN_DIGITAL = 'westerndigital'` to the `Site` enum. | must |
| FR-2 | `WesternDigitalService` implements `IScraper`, `@SourcePlugin({ site: Site.WESTERN_DIGITAL, name: 'Western Digital', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'WesternDigital' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.WESTERN_DIGITAL`, `companyName = 'Western Digital'`, `id` prefix `sr-`→`westerndigital-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Hard disk drives and flash/SSD storage
- Enterprise and data center storage solutions
- Firmware and software engineering
- Publicly traded (NASDAQ: WDC)
