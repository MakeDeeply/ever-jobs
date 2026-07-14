# Spec: 1433 — Source Company Plugin: Derex Technologies

| Field | Value |
| --- | --- |
| Spec ID | 1433 |
| Slug | source-company-derextechnologies |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-derextechnologies` for **Derex Technologies** (IT consulting, staffing and software services firm established in 1996.). Sector:
IT consulting and staffing. HQ: Harrison, New Jersey, United States.

The company's live postings are served by **SmartRecruiters** on company
identifier `DerexTechnologiesInc` (`https://jobs.smartrecruiters.com/DerexTechnologiesInc`),
which exposed **9 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-derextechnologies` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DEREX_TECHNOLOGIES`** in the source
> registry, so that a single `siteType: [Site.DEREX_TECHNOLOGIES]` request returns
> Derex Technologies's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DEREX_TECHNOLOGIES = 'derextechnologies'` to the `Site` enum. | must |
| FR-2 | `DerexTechnologiesService` implements `IScraper`, `@SourcePlugin({ site: Site.DEREX_TECHNOLOGIES, name: 'Derex Technologies', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'DerexTechnologiesInc' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DEREX_TECHNOLOGIES`, `companyName = 'Derex Technologies'`, `id` prefix `sr-`→`derextechnologies-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- IT consulting and staffing
- Software services
- Established 1996
