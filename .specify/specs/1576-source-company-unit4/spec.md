# Spec: 1576 — Source Company Plugin: Unit4

| Field | Value |
| --- | --- |
| Spec ID | 1576 |
| Slug | source-company-unit4 |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-unit4` for **Unit4** (Enterprise resource planning (ERP) software provider.). Sector:
Enterprise software (ERP). HQ: Utrecht, Netherlands.

The company's live postings are served by **SmartRecruiters** on company
identifier `unit44` (`https://jobs.smartrecruiters.com/unit44`),
which exposed **26 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-unit4` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.UNIT4`** in the source
> registry, so that a single `siteType: [Site.UNIT4]` request returns
> Unit4's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.UNIT4 = 'unit4'` to the `Site` enum. | must |
| FR-2 | `Unit4Service` implements `IScraper`, `@SourcePlugin({ site: Site.UNIT4, name: 'Unit4', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'unit44' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.UNIT4`, `companyName = 'Unit4'`, `id` prefix `sr-`→`unit4-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Cloud ERP software
- Financials and HCM modules
- Professional services automation
- Mid-market focus
