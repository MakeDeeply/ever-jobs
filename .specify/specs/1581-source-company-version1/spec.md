# Spec: 1581 — Source Company Plugin: Version 1

| Field | Value |
| --- | --- |
| Spec ID | 1581 |
| Slug | source-company-version1 |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-version1` for **Version 1** (Technology services firm delivering enterprise applications and cloud solutions.). Sector:
IT services and enterprise software consulting. HQ: Dublin, Ireland.

The company's live postings are served by **SmartRecruiters** on company
identifier `Version1` (`https://jobs.smartrecruiters.com/Version1`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-version1` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.VERSION_1`** in the source
> registry, so that a single `siteType: [Site.VERSION_1]` request returns
> Version 1's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.VERSION_1 = 'version1'` to the `Site` enum. | must |
| FR-2 | `Version1Service` implements `IScraper`, `@SourcePlugin({ site: Site.VERSION_1, name: 'Version 1', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Version1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.VERSION_1`, `companyName = 'Version 1'`, `id` prefix `sr-`→`version1-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Enterprise application delivery (Oracle, Microsoft, AWS)
- Cloud and digital transformation services
- Data and AI engineering
- Managed IT services
