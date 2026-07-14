# Spec: 1540 — Source Company Plugin: ServiceNow

| Field | Value |
| --- | --- |
| Spec ID | 1540 |
| Slug | source-company-servicenow |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-servicenow` for **ServiceNow** (Cloud platform for digital workflows and IT service management.). Sector:
Enterprise software (cloud workflow / ITSM platform). HQ: Santa Clara, California, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `ServiceNow` (`https://jobs.smartrecruiters.com/ServiceNow`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-servicenow` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SERVICENOW`** in the source
> registry, so that a single `siteType: [Site.SERVICENOW]` request returns
> ServiceNow's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SERVICENOW = 'servicenow'` to the `Site` enum. | must |
| FR-2 | `ServiceNowService` implements `IScraper`, `@SourcePlugin({ site: Site.SERVICENOW, name: 'ServiceNow', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ServiceNow' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SERVICENOW`, `companyName = 'ServiceNow'`, `id` prefix `sr-`→`servicenow-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Now Platform for enterprise workflow automation
- IT service management (ITSM) and IT operations
- Low-code app development
- Publicly traded (NYSE: NOW)
