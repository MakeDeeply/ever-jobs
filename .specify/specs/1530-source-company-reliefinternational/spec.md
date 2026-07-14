# Spec: 1530 — Source Company Plugin: Relief International

| Field | Value |
| --- | --- |
| Spec ID | 1530 |
| Slug | source-company-reliefinternational |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-reliefinternational` for **Relief International** (Humanitarian non-profit working in fragile settings across roughly 20 countries.). Sector:
Non-profit (humanitarian / international development). HQ: Washington, D.C., USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `ReliefInternational` (`https://jobs.smartrecruiters.com/ReliefInternational`),
which exposed **6 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-reliefinternational` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.RELIEF_INTERNATIONAL`** in the source
> registry, so that a single `siteType: [Site.RELIEF_INTERNATIONAL]` request returns
> Relief International's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.RELIEF_INTERNATIONAL = 'reliefinternational'` to the `Site` enum. | must |
| FR-2 | `ReliefInternationalService` implements `IScraper`, `@SourcePlugin({ site: Site.RELIEF_INTERNATIONAL, name: 'Relief International', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ReliefInternational' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.RELIEF_INTERNATIONAL`, `companyName = 'Relief International'`, `id` prefix `sr-`→`reliefinternational-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Humanitarian work in fragile settings
- Operates in roughly 20 countries
- Non-profit organization
