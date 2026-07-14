# Spec: 1434 — Source Company Plugin: Deutsche Telekom IT Solutions

| Field | Value |
| --- | --- |
| Spec ID | 1434 |
| Slug | source-company-deutschetelekomitsolutions |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-deutschetelekomitsolutions` for **Deutsche Telekom IT Solutions** (IT services and solutions arm of Deutsche Telekom.). Sector:
IT services and enterprise technology. HQ: Budapest, Hungary.

The company's live postings are served by **SmartRecruiters** on company
identifier `deutschetelekomitsolutions` (`https://jobs.smartrecruiters.com/deutschetelekomitsolutions`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-deutschetelekomitsolutions` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DEUTSCHE_TELEKOM_IT_SOLUTIONS`** in the source
> registry, so that a single `siteType: [Site.DEUTSCHE_TELEKOM_IT_SOLUTIONS]` request returns
> Deutsche Telekom IT Solutions's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DEUTSCHE_TELEKOM_IT_SOLUTIONS = 'deutschetelekomitsolutions'` to the `Site` enum. | must |
| FR-2 | `DeutscheTelekomITSolutionsService` implements `IScraper`, `@SourcePlugin({ site: Site.DEUTSCHE_TELEKOM_IT_SOLUTIONS, name: 'Deutsche Telekom IT Solutions', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'deutschetelekomitsolutions' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DEUTSCHE_TELEKOM_IT_SOLUTIONS`, `companyName = 'Deutsche Telekom IT Solutions'`, `id` prefix `sr-`→`deutschetelekomitsolutions-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Enterprise IT services and software development
- Cloud and network engineering
- Part of Deutsche Telekom group
- European delivery centers
