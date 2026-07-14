# Spec: 1537 — Source Company Plugin: SEAKR Engineering

| Field | Value |
| --- | --- |
| Spec ID | 1537 |
| Slug | source-company-seakrengineering |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-seakrengineering` for **SEAKR Engineering** (Manufacturer of advanced electronics for space and satellite applications.). Sector:
Aerospace electronics manufacturing. HQ: Centennial, Colorado, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `SEAKREngineering` (`https://jobs.smartrecruiters.com/SEAKREngineering`),
which exposed **18 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-seakrengineering` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SEAKR_ENGINEERING`** in the source
> registry, so that a single `siteType: [Site.SEAKR_ENGINEERING]` request returns
> SEAKR Engineering's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SEAKR_ENGINEERING = 'seakrengineering'` to the `Site` enum. | must |
| FR-2 | `SEAKREngineeringService` implements `IScraper`, `@SourcePlugin({ site: Site.SEAKR_ENGINEERING, name: 'SEAKR Engineering', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'SEAKREngineering' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SEAKR_ENGINEERING`, `companyName = 'SEAKR Engineering'`, `id` prefix `sr-`→`seakrengineering-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Manufactures space-grade electronics and processing systems
- Serves satellite and spacecraft programs
- Engineering and manufacturing operations in Colorado
