# Spec: 1641 — Source Company Plugin: Nmbrs

| Field | Value |
| --- | --- |
| Spec ID | 1641 |
| Slug | source-company-nmbrs |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-nmbrs` for **Nmbrs** (Cloud HR and payroll software for accountants and businesses.). Sector:
HR / payroll SaaS. HQ: Amsterdam, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`nmbrs` (`https://nmbrs.recruitee.com`), which exposed
**5 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-nmbrs` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NMBRS`** in the source
> registry, so that a single `siteType: [Site.NMBRS]` request returns
> Nmbrs's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NMBRS = 'nmbrs'` to the `Site` enum. | must |
| FR-2 | `NmbrsService` implements `IScraper`, `@SourcePlugin({ site: Site.NMBRS, name: 'Nmbrs', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'nmbrs' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NMBRS`, `companyName = 'Nmbrs'`, `id` prefix `recruitee-`→`nmbrs-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Amsterdam-based HR & payroll SaaS
- Targets accountants and businesses
- Recruitee board nmbrs.recruitee.com verified
