# Spec: 1492 — Source Company Plugin: MAT Holdings

| Field | Value |
| --- | --- |
| Spec ID | 1492 |
| Slug | source-company-matholdings |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-matholdings` for **MAT Holdings** (Diversified manufacturer of automotive parts, fencing, hardware, and power equipment.). Sector:
Industrial manufacturing / Diversified. HQ: Long Grove, Illinois, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `MATHoldings` (`https://jobs.smartrecruiters.com/MATHoldings`),
which exposed **44 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-matholdings` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MAT_HOLDINGS`** in the source
> registry, so that a single `siteType: [Site.MAT_HOLDINGS]` request returns
> MAT Holdings's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MAT_HOLDINGS = 'matholdings'` to the `Site` enum. | must |
| FR-2 | `MATHoldingsService` implements `IScraper`, `@SourcePlugin({ site: Site.MAT_HOLDINGS, name: 'MAT Holdings', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'MATHoldings' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MAT_HOLDINGS`, `companyName = 'MAT Holdings'`, `id` prefix `sr-`→`matholdings-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Manufactures automotive aftermarket parts and components
- Also produces fencing, hardware, and power equipment
- Multinational manufacturing and distribution operations
