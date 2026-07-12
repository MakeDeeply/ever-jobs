# Spec: 1380 — Source Company Plugin: Achieve

| Field | Value |
| --- | --- |
| Spec ID | 1380 |
| Slug | source-company-achieve |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-achieve` for **Achieve** (Digital personal finance company offering lending and debt resolution products.). Sector:
Fintech / consumer finance & lending. HQ: Tempe, Arizona, USA (San Mateo, CA).

The company's live postings are served by **SmartRecruiters** on company
identifier `Achieve1` (`https://jobs.smartrecruiters.com/Achieve1`),
which exposed **47 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-achieve` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ACHIEVE`** in the source
> registry, so that a single `siteType: [Site.ACHIEVE]` request returns
> Achieve's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ACHIEVE = 'achieve'` to the `Site` enum. | must |
| FR-2 | `AchieveService` implements `IScraper`, `@SourcePlugin({ site: Site.ACHIEVE, name: 'Achieve', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Achieve1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ACHIEVE`, `companyName = 'Achieve'`, `id` prefix `sr-`→`achieve-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Personal loans
- Home equity lending
- Debt resolution services
- Digital consumer finance
