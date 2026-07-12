# Spec: 1578 — Source Company Plugin: University of the West of England

| Field | Value |
| --- | --- |
| Spec ID | 1578 |
| Slug | source-company-universityofthewestofengland |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-universityofthewestofengland` for **University of the West of England** (Public research university based in Bristol, England.). Sector:
Education (higher education). HQ: Bristol, England, United Kingdom.

The company's live postings are served by **SmartRecruiters** on company
identifier `UniversityOfTheWestOfEngland` (`https://jobs.smartrecruiters.com/UniversityOfTheWestOfEngland`),
which exposed **25 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-universityofthewestofengland` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.UNIVERSITY_OF_THE_WEST_OF_ENGLAND`** in the source
> registry, so that a single `siteType: [Site.UNIVERSITY_OF_THE_WEST_OF_ENGLAND]` request returns
> University of the West of England's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.UNIVERSITY_OF_THE_WEST_OF_ENGLAND = 'universityofthewestofengland'` to the `Site` enum. | must |
| FR-2 | `UniversityOfTheWestOfEnglandService` implements `IScraper`, `@SourcePlugin({ site: Site.UNIVERSITY_OF_THE_WEST_OF_ENGLAND, name: 'University of the West of England', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'UniversityOfTheWestOfEngland' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.UNIVERSITY_OF_THE_WEST_OF_ENGLAND`, `companyName = 'University of the West of England'`, `id` prefix `sr-`→`universityofthewestofengland-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Public research university in the UK
- Based in Bristol, England
- Postings include academic and facilities roles
