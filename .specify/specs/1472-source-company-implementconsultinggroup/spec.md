# Spec: 1472 — Source Company Plugin: Implement Consulting Group

| Field | Value |
| --- | --- |
| Spec ID | 1472 |
| Slug | source-company-implementconsultinggroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-implementconsultinggroup` for **Implement Consulting Group** (Nordic-headquartered management consultancy with offices across the Nordics and DACH.). Sector:
Management consulting. HQ: Hellerup (Copenhagen), Denmark.

The company's live postings are served by **SmartRecruiters** on company
identifier `ImplementConsultingGroup` (`https://jobs.smartrecruiters.com/ImplementConsultingGroup`),
which exposed **52 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-implementconsultinggroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.IMPLEMENT_CONSULTING_GROUP`** in the source
> registry, so that a single `siteType: [Site.IMPLEMENT_CONSULTING_GROUP]` request returns
> Implement Consulting Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.IMPLEMENT_CONSULTING_GROUP = 'implementconsultinggroup'` to the `Site` enum. | must |
| FR-2 | `ImplementConsultingGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.IMPLEMENT_CONSULTING_GROUP, name: 'Implement Consulting Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ImplementConsultingGroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.IMPLEMENT_CONSULTING_GROUP`, `companyName = 'Implement Consulting Group'`, `id` prefix `sr-`→`implementconsultinggroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Headquartered near Copenhagen, Denmark
- Management and strategy consulting
- Offices across the Nordics and DACH region
- Focus on strategy, operations and change
