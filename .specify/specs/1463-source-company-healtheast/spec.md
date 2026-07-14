# Spec: 1463 — Source Company Plugin: HealthEast

| Field | Value |
| --- | --- |
| Spec ID | 1463 |
| Slug | source-company-healtheast |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-healtheast` for **HealthEast** (Health care system operating hospitals and clinics in the Minnesota Twin Cities east metro.). Sector:
Healthcare / Hospital System. HQ: St. Paul, Minnesota, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `HealthEastCareSystem` (`https://jobs.smartrecruiters.com/HealthEastCareSystem`),
which exposed **3 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-healtheast` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HEALTHEAST`** in the source
> registry, so that a single `siteType: [Site.HEALTHEAST]` request returns
> HealthEast's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HEALTHEAST = 'healtheast'` to the `Site` enum. | must |
| FR-2 | `HealthEastService` implements `IScraper`, `@SourcePlugin({ site: Site.HEALTHEAST, name: 'HealthEast', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'HealthEastCareSystem' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HEALTHEAST`, `companyName = 'HealthEast'`, `id` prefix `sr-`→`healtheast-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Hospitals and clinics in the Twin Cities
- Serves the east metro of Minnesota
- Acute and clinic-based care
- Part of a larger Minnesota health system
