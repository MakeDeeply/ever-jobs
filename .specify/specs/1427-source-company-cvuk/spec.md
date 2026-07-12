# Spec: 1427 — Source Company Plugin: CVUK

| Field | Value |
| --- | --- |
| Spec ID | 1427 |
| Slug | source-company-cvuk |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-cvuk` for **CVUK** (UK recruitment consultancy specialising in fashion and retail talent.). Sector:
Recruitment (fashion & retail). HQ: United Kingdom.

The company's live postings are served by **SmartRecruiters** on company
identifier `CVUK` (`https://jobs.smartrecruiters.com/CVUK`),
which exposed **25 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-cvuk` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CVUK`** in the source
> registry, so that a single `siteType: [Site.CVUK]` request returns
> CVUK's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CVUK = 'cvuk'` to the `Site` enum. | must |
| FR-2 | `CVUKService` implements `IScraper`, `@SourcePlugin({ site: Site.CVUK, name: 'CVUK', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'CVUK' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CVUK`, `companyName = 'CVUK'`, `id` prefix `sr-`→`cvuk-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Based in the United Kingdom
- Recruitment for fashion and retail
- Permanent, contract and freelance placement
- Design, buying and merchandising roles
