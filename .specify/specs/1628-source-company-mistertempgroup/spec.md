# Spec: 1628 — Source Company Plugin: Mistertemp' Group

| Field | Value |
| --- | --- |
| Spec ID | 1628 |
| Slug | source-company-mistertempgroup |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-mistertempgroup` for **Mistertemp' Group** (HR-tech group combining digital staffing platforms with a network of physical agencies.). Sector:
HR Tech / Staffing SaaS. HQ: Paris, France.

The company's live postings are served by **Recruitee** on subdomain
`jobsmistertemp` (`https://jobsmistertemp.recruitee.com`), which exposed
**27 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-mistertempgroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MISTERTEMP_GROUP`** in the source
> registry, so that a single `siteType: [Site.MISTERTEMP_GROUP]` request returns
> Mistertemp' Group's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MISTERTEMP_GROUP = 'mistertempgroup'` to the `Site` enum. | must |
| FR-2 | `MistertempGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.MISTERTEMP_GROUP, name: 'Mistertemp' Group', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'jobsmistertemp' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MISTERTEMP_GROUP`, `companyName = 'Mistertemp' Group'`, `id` prefix `recruitee-`→`mistertempgroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board: https://jobsmistertemp.recruitee.com/api/offers returns 9 open offers
- Recognized in French Tech 120 and Next 40
- Proprietary products MisterMatch (HRIS) and Mistertemp'+ (healthcare staffing SaaS)
