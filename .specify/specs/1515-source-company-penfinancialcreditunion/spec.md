# Spec: 1515 — Source Company Plugin: PenFinancial Credit Union

| Field | Value |
| --- | --- |
| Spec ID | 1515 |
| Slug | source-company-penfinancialcreditunion |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-penfinancialcreditunion` for **PenFinancial Credit Union** (Ontario-based credit union offering personal and business banking services.). Sector:
Banking / credit union. HQ: Niagara region, Ontario, Canada.

The company's live postings are served by **SmartRecruiters** on company
identifier `PenFinancialCreditUnion` (`https://jobs.smartrecruiters.com/PenFinancialCreditUnion`),
which exposed **4 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-penfinancialcreditunion` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PENFINANCIAL_CREDIT_UNION`** in the source
> registry, so that a single `siteType: [Site.PENFINANCIAL_CREDIT_UNION]` request returns
> PenFinancial Credit Union's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PENFINANCIAL_CREDIT_UNION = 'penfinancialcreditunion'` to the `Site` enum. | must |
| FR-2 | `PenFinancialCreditUnionService` implements `IScraper`, `@SourcePlugin({ site: Site.PENFINANCIAL_CREDIT_UNION, name: 'PenFinancial Credit Union', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'PenFinancialCreditUnion' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PENFINANCIAL_CREDIT_UNION`, `companyName = 'PenFinancial Credit Union'`, `id` prefix `sr-`→`penfinancialcreditunion-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Personal and business banking
- Lending and investment services
- Member-owned cooperative
- Niagara region, Ontario
