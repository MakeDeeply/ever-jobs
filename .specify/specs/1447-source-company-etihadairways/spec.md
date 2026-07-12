# Spec: 1447 — Source Company Plugin: Etihad Airways

| Field | Value |
| --- | --- |
| Spec ID | 1447 |
| Slug | source-company-etihadairways |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-etihadairways` for **Etihad Airways** (The national airline of the United Arab Emirates, operating passenger and cargo flights from its Abu Dhabi hub.). Sector:
Airlines. HQ: Abu Dhabi, Abu Dhabi, United Arab Emirates.

The company's live postings are served by **SmartRecruiters** on company
identifier `EtihadAirways5` (`https://jobs.smartrecruiters.com/EtihadAirways5`),
which exposed **79 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-etihadairways` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ETIHAD_AIRWAYS`** in the source
> registry, so that a single `siteType: [Site.ETIHAD_AIRWAYS]` request returns
> Etihad Airways's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ETIHAD_AIRWAYS = 'etihadairways'` to the `Site` enum. | must |
| FR-2 | `EtihadAirwaysService` implements `IScraper`, `@SourcePlugin({ site: Site.ETIHAD_AIRWAYS, name: 'Etihad Airways', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'EtihadAirways5' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ETIHAD_AIRWAYS`, `companyName = 'Etihad Airways'`, `id` prefix `sr-`→`etihadairways-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Flag carrier of the UAE
- Hub at Abu Dhabi (Zayed International Airport)
- Passenger and cargo operations
- Hiring cabin crew, pilots, and corporate staff
