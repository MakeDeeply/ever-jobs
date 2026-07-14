# Spec: 1520 — Source Company Plugin: PrimeLending

| Field | Value |
| --- | --- |
| Spec ID | 1520 |
| Slug | source-company-primelending |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-primelending` for **PrimeLending** (US residential mortgage lender originating purchase and refinance home loans.). Sector:
Financial services / mortgage lending. HQ: Dallas, Texas, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `PrimeLending` (`https://jobs.smartrecruiters.com/PrimeLending`),
which exposed **4 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-primelending` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PRIMELENDING`** in the source
> registry, so that a single `siteType: [Site.PRIMELENDING]` request returns
> PrimeLending's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PRIMELENDING = 'primelending'` to the `Site` enum. | must |
| FR-2 | `PrimeLendingService` implements `IScraper`, `@SourcePlugin({ site: Site.PRIMELENDING, name: 'PrimeLending', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'PrimeLending' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PRIMELENDING`, `companyName = 'PrimeLending'`, `id` prefix `sr-`→`primelending-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Residential mortgage origination
- Purchase and refinance loans
- Conventional, FHA, VA, USDA products
- Subsidiary of Hilltop Holdings
