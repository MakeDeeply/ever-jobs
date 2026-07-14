# Spec: 1405 — Source Company Plugin: Bosch Group

| Field | Value |
| --- | --- |
| Spec ID | 1405 |
| Slug | source-company-boschgroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-boschgroup` for **Bosch Group** (Global technology and engineering company spanning mobility, industrial, and software.). Sector:
Technology and engineering (industrial, mobility, software). HQ: Gerlingen, Germany.

The company's live postings are served by **SmartRecruiters** on company
identifier `BoschGroup` (`https://jobs.smartrecruiters.com/BoschGroup`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-boschgroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.BOSCH_GROUP`** in the source
> registry, so that a single `siteType: [Site.BOSCH_GROUP]` request returns
> Bosch Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.BOSCH_GROUP = 'boschgroup'` to the `Site` enum. | must |
| FR-2 | `BoschGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.BOSCH_GROUP, name: 'Bosch Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'BoschGroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.BOSCH_GROUP`, `companyName = 'Bosch Group'`, `id` prefix `sr-`→`boschgroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Mobility, industrial, and consumer technology
- Software, IoT and automation engineering
- Global R&D operations
- Privately held (Robert Bosch GmbH)
