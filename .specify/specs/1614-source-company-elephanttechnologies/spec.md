# Spec: 1614 — Source Company Plugin: Elephant Technologies

| Field | Value |
| --- | --- |
| Spec ID | 1614 |
| Slug | source-company-elephanttechnologies |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-elephanttechnologies` for **Elephant Technologies** (Technology consulting and engineering services firm (ESN) specializing in QA, DevOps and project delivery.). Sector:
IT services / Engineering (ESN). HQ: Nantes, France.

The company's live postings are served by **Recruitee** on subdomain
`elephanttechnologies` (`https://elephanttechnologies.recruitee.com`), which exposed
**16 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-elephanttechnologies` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ELEPHANT_TECHNOLOGIES`** in the source
> registry, so that a single `siteType: [Site.ELEPHANT_TECHNOLOGIES]` request returns
> Elephant Technologies's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ELEPHANT_TECHNOLOGIES = 'elephanttechnologies'` to the `Site` enum. | must |
| FR-2 | `ElephantTechnologiesService` implements `IScraper`, `@SourcePlugin({ site: Site.ELEPHANT_TECHNOLOGIES, name: 'Elephant Technologies', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'elephanttechnologies' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ELEPHANT_TECHNOLOGIES`, `companyName = 'Elephant Technologies'`, `id` prefix `recruitee-`→`elephanttechnologies-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board: https://elephanttechnologies.recruitee.com/api/offers returns 4 open offers
- Headquartered in Nantes
- Services include QA, DevOps, and technical project delivery
