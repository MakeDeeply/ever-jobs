# Spec: 1563 — Source Company Plugin: Syngenta Group

| Field | Value |
| --- | --- |
| Spec ID | 1563 |
| Slug | source-company-syngentagroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-syngentagroup` for **Syngenta Group** (Swiss-headquartered global agriculture company in crop protection and seeds.). Sector:
Agriculture (crop protection & seeds). HQ: Basel, Switzerland.

The company's live postings are served by **SmartRecruiters** on company
identifier `SyngentaGroup` (`https://jobs.smartrecruiters.com/SyngentaGroup`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-syngentagroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SYNGENTA_GROUP`** in the source
> registry, so that a single `siteType: [Site.SYNGENTA_GROUP]` request returns
> Syngenta Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SYNGENTA_GROUP = 'syngentagroup'` to the `Site` enum. | must |
| FR-2 | `SyngentaGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.SYNGENTA_GROUP, name: 'Syngenta Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'SyngentaGroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SYNGENTA_GROUP`, `companyName = 'Syngenta Group'`, `id` prefix `sr-`→`syngentagroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Headquartered in Basel, Switzerland
- Crop protection, seeds and digital agriculture
- Global research and manufacturing footprint
- Serves farmers across many countries
