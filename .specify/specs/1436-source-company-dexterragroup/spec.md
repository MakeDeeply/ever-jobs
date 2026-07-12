# Spec: 1436 — Source Company Plugin: Dexterra Group

| Field | Value |
| --- | --- |
| Spec ID | 1436 |
| Slug | source-company-dexterragroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-dexterragroup` for **Dexterra Group** (Provider of facilities management, workforce accommodations, and industrial support services.). Sector:
Facilities management / Industrial services. HQ: Toronto, Ontario, Canada.

The company's live postings are served by **SmartRecruiters** on company
identifier `Dexterra` (`https://jobs.smartrecruiters.com/Dexterra`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-dexterragroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DEXTERRA_GROUP`** in the source
> registry, so that a single `siteType: [Site.DEXTERRA_GROUP]` request returns
> Dexterra Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DEXTERRA_GROUP = 'dexterragroup'` to the `Site` enum. | must |
| FR-2 | `DexterraGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.DEXTERRA_GROUP, name: 'Dexterra Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Dexterra' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DEXTERRA_GROUP`, `companyName = 'Dexterra Group'`, `id` prefix `sr-`→`dexterragroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Provides facilities management and industrial maintenance services
- Publicly listed on the TSX (DXT)
- Operations across North America including remote sites
