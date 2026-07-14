# Spec: 1435 — Source Company Plugin: Deutsche Telekom IT Solutions Slovakia

| Field | Value |
| --- | --- |
| Spec ID | 1435 |
| Slug | source-company-deutschetelekomitsolutionsslovakia |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-deutschetelekomitsolutionsslovakia` for **Deutsche Telekom IT Solutions Slovakia** (Slovak IT services and delivery center of Deutsche Telekom.). Sector:
IT services and enterprise technology. HQ: Kosice, Slovakia.

The company's live postings are served by **SmartRecruiters** on company
identifier `DeutscheTelekomITSolutionsSlovakia` (`https://jobs.smartrecruiters.com/DeutscheTelekomITSolutionsSlovakia`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-deutschetelekomitsolutionsslovakia` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DEUTSCHE_TELEKOM_IT_SOLUTIONS_SLOVAKIA`** in the source
> registry, so that a single `siteType: [Site.DEUTSCHE_TELEKOM_IT_SOLUTIONS_SLOVAKIA]` request returns
> Deutsche Telekom IT Solutions Slovakia's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DEUTSCHE_TELEKOM_IT_SOLUTIONS_SLOVAKIA = 'deutschetelekomitsolutionsslovakia'` to the `Site` enum. | must |
| FR-2 | `DeutscheTelekomITSolutionsSlovakiaService` implements `IScraper`, `@SourcePlugin({ site: Site.DEUTSCHE_TELEKOM_IT_SOLUTIONS_SLOVAKIA, name: 'Deutsche Telekom IT Solutions Slovakia', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'DeutscheTelekomITSolutionsSlovakia' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DEUTSCHE_TELEKOM_IT_SOLUTIONS_SLOVAKIA`, `companyName = 'Deutsche Telekom IT Solutions Slovakia'`, `id` prefix `sr-`→`deutschetelekomitsolutionsslovakia-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Software development and IT operations
- Network and cloud engineering
- Part of Deutsche Telekom group
- Major Slovak technology employer
