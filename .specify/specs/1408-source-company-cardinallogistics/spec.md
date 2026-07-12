# Spec: 1408 — Source Company Plugin: Cardinal Logistics

| Field | Value |
| --- | --- |
| Spec ID | 1408 |
| Slug | source-company-cardinallogistics |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-cardinallogistics` for **Cardinal Logistics** (US dedicated trucking and transportation logistics provider.). Sector:
Logistics & Trucking. HQ: Concord, North Carolina, United States.

The company's live postings are served by **SmartRecruiters** on company
identifier `CardinalLogistics1` (`https://jobs.smartrecruiters.com/CardinalLogistics1`),
which exposed **8 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-cardinallogistics` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CARDINAL_LOGISTICS`** in the source
> registry, so that a single `siteType: [Site.CARDINAL_LOGISTICS]` request returns
> Cardinal Logistics's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CARDINAL_LOGISTICS = 'cardinallogistics'` to the `Site` enum. | must |
| FR-2 | `CardinalLogisticsService` implements `IScraper`, `@SourcePlugin({ site: Site.CARDINAL_LOGISTICS, name: 'Cardinal Logistics', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'CardinalLogistics1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CARDINAL_LOGISTICS`, `companyName = 'Cardinal Logistics'`, `id` prefix `sr-`→`cardinallogistics-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Dedicated fleet trucking operations
- Freight brokerage and supply chain services
- US-wide operations
- Headquartered in Concord, North Carolina
