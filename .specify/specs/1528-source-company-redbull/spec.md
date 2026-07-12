# Spec: 1528 — Source Company Plugin: Red Bull

| Field | Value |
| --- | --- |
| Spec ID | 1528 |
| Slug | source-company-redbull |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-redbull` for **Red Bull** (Energy drink company with a large media, sports, esports and entertainment arm.). Sector:
Media & Entertainment. HQ: Fuschl am See, Salzburg, Austria.

The company's live postings are served by **SmartRecruiters** on company
identifier `RedBull` (`https://jobs.smartrecruiters.com/RedBull`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-redbull` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.RED_BULL`** in the source
> registry, so that a single `siteType: [Site.RED_BULL]` request returns
> Red Bull's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.RED_BULL = 'redbull'` to the `Site` enum. | must |
| FR-2 | `RedBullService` implements `IScraper`, `@SourcePlugin({ site: Site.RED_BULL, name: 'Red Bull', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'RedBull' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.RED_BULL`, `companyName = 'Red Bull'`, `id` prefix `sr-`→`redbull-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- HQ in Fuschl am See, Austria
- Operates Red Bull Media House content division
- Active in sports, esports and live events
- Global hiring across many countries
