# Spec: 1478 — Source Company Plugin: Keywords Studios

| Field | Value |
| --- | --- |
| Spec ID | 1478 |
| Slug | source-company-keywordsstudios |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-keywordsstudios` for **Keywords Studios** (Provider of technical and creative services to the video games industry.). Sector:
Video Games (Services). HQ: Dublin, Ireland.

The company's live postings are served by **SmartRecruiters** on company
identifier `KeywordsStudios` (`https://jobs.smartrecruiters.com/KeywordsStudios`),
which exposed **67 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-keywordsstudios` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.KEYWORDS_STUDIOS`** in the source
> registry, so that a single `siteType: [Site.KEYWORDS_STUDIOS]` request returns
> Keywords Studios's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.KEYWORDS_STUDIOS = 'keywordsstudios'` to the `Site` enum. | must |
| FR-2 | `KeywordsStudiosService` implements `IScraper`, `@SourcePlugin({ site: Site.KEYWORDS_STUDIOS, name: 'Keywords Studios', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'KeywordsStudios' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.KEYWORDS_STUDIOS`, `companyName = 'Keywords Studios'`, `id` prefix `sr-`→`keywordsstudios-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- HQ in Dublin, Ireland
- Outsourced services to the games industry
- Global network of studios
- Roles in development, art and QA
