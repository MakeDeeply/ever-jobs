# Spec: 1582 — Source Company Plugin: Villa Group

| Field | Value |
| --- | --- |
| Spec ID | 1582 |
| Slug | source-company-villagroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-villagroup` for **Villa Group** (Mexican resort operator managing beachfront hotels and vacation properties.). Sector:
Hospitality. HQ: Puerto Vallarta, Jalisco, Mexico.

The company's live postings are served by **SmartRecruiters** on company
identifier `VillaGroup` (`https://jobs.smartrecruiters.com/VillaGroup`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-villagroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.VILLA_GROUP`** in the source
> registry, so that a single `siteType: [Site.VILLA_GROUP]` request returns
> Villa Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.VILLA_GROUP = 'villagroup'` to the `Site` enum. | must |
| FR-2 | `VillaGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.VILLA_GROUP, name: 'Villa Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'VillaGroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.VILLA_GROUP`, `companyName = 'Villa Group'`, `id` prefix `sr-`→`villagroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Beachfront resorts across Mexico
- Destinations include Cancun and Cabo San Lucas
- Hotels, spas, and leisure services
