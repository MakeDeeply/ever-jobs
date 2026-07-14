# Spec: 1589 — Source Company Plugin: WSH Group

| Field | Value |
| --- | --- |
| Spec ID | 1589 |
| Slug | source-company-wshgroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-wshgroup` for **WSH Group** (UK contract catering and hospitality group operating brands including BaxterStorey.). Sector:
Hospitality & Catering. HQ: London, England, United Kingdom.

The company's live postings are served by **SmartRecruiters** on company
identifier `WSHGroup` (`https://jobs.smartrecruiters.com/WSHGroup`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-wshgroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.WSH_GROUP`** in the source
> registry, so that a single `siteType: [Site.WSH_GROUP]` request returns
> WSH Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.WSH_GROUP = 'wshgroup'` to the `Site` enum. | must |
| FR-2 | `WSHGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.WSH_GROUP, name: 'WSH Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'WSHGroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.WSH_GROUP`, `companyName = 'WSH Group'`, `id` prefix `sr-`→`wshgroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Contract catering and hospitality
- Brands include BaxterStorey and Searcys
- Serves offices, venues, and events
- Headquartered in London
