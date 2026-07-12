# Spec: 1448 — Source Company Plugin: Eurofins Scientific

| Field | Value |
| --- | --- |
| Spec ID | 1448 |
| Slug | source-company-eurofinsscientific |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-eurofinsscientific` for **Eurofins Scientific** (Laboratory group providing analytical testing services across food, environment, pharma, and electronics.). Sector:
Laboratory testing / Analytical services. HQ: Luxembourg.

The company's live postings are served by **SmartRecruiters** on company
identifier `Eurofins` (`https://jobs.smartrecruiters.com/Eurofins`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-eurofinsscientific` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.EUROFINS_SCIENTIFIC`** in the source
> registry, so that a single `siteType: [Site.EUROFINS_SCIENTIFIC]` request returns
> Eurofins Scientific's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.EUROFINS_SCIENTIFIC = 'eurofinsscientific'` to the `Site` enum. | must |
| FR-2 | `EurofinsScientificService` implements `IScraper`, `@SourcePlugin({ site: Site.EUROFINS_SCIENTIFIC, name: 'Eurofins Scientific', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Eurofins' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.EUROFINS_SCIENTIFIC`, `companyName = 'Eurofins Scientific'`, `id` prefix `sr-`→`eurofinsscientific-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Operates a large international network of testing laboratories
- Serves pharma, food, environmental, and electronics sectors
- Provides failure analysis and reliability engineering services
