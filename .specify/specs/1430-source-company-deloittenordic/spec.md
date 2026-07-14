# Spec: 1430 — Source Company Plugin: Deloitte (Nordic)

| Field | Value |
| --- | --- |
| Spec ID | 1430 |
| Slug | source-company-deloittenordic |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-deloittenordic` for **Deloitte (Nordic)** (Deloitte's Nordic professional-services organisation covering audit, tax, consulting and advisory.). Sector:
Professional services (audit, tax, consulting, advisory). HQ: Copenhagen, Denmark (Nordic region).

The company's live postings are served by **SmartRecruiters** on company
identifier `DeloitteNordic` (`https://jobs.smartrecruiters.com/DeloitteNordic`),
which exposed **76 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-deloittenordic` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DELOITTE_NORDIC`** in the source
> registry, so that a single `siteType: [Site.DELOITTE_NORDIC]` request returns
> Deloitte (Nordic)'s live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DELOITTE_NORDIC = 'deloittenordic'` to the `Site` enum. | must |
| FR-2 | `DeloitteNordicService` implements `IScraper`, `@SourcePlugin({ site: Site.DELOITTE_NORDIC, name: 'Deloitte (Nordic)', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'DeloitteNordic' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DELOITTE_NORDIC`, `companyName = 'Deloitte (Nordic)'`, `id` prefix `sr-`→`deloittenordic-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Nordic region member firm (Denmark, Sweden, Norway, Finland, Iceland)
- Audit, tax, consulting and advisory services
- Part of the global Deloitte network
- Large regional professional-services employer
