# Spec: 1444 — Source Company Plugin: Entertainment Benefits Group

| Field | Value |
| --- | --- |
| Spec ID | 1444 |
| Slug | source-company-entertainmentbenefitsgroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-entertainmentbenefitsgroup` for **Entertainment Benefits Group** (E-commerce provider of entertainment, travel and attraction offerings.). Sector:
Entertainment & Travel Commerce. HQ: Austin, Texas, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `EntertainmentBenefitsGroup` (`https://jobs.smartrecruiters.com/EntertainmentBenefitsGroup`),
which exposed **10 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-entertainmentbenefitsgroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ENTERTAINMENT_BENEFITS_GROUP`** in the source
> registry, so that a single `siteType: [Site.ENTERTAINMENT_BENEFITS_GROUP]` request returns
> Entertainment Benefits Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ENTERTAINMENT_BENEFITS_GROUP = 'entertainmentbenefitsgroup'` to the `Site` enum. | must |
| FR-2 | `EntertainmentBenefitsGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.ENTERTAINMENT_BENEFITS_GROUP, name: 'Entertainment Benefits Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'EntertainmentBenefitsGroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ENTERTAINMENT_BENEFITS_GROUP`, `companyName = 'Entertainment Benefits Group'`, `id` prefix `sr-`→`entertainmentbenefitsgroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- US-based e-commerce company
- Focus on entertainment and travel offerings
- Operates consumer-facing platforms
- Roles in e-commerce and operations
