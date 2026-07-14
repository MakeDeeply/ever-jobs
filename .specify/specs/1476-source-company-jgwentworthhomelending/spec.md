# Spec: 1476 — Source Company Plugin: JG Wentworth Home Lending

| Field | Value |
| --- | --- |
| Spec ID | 1476 |
| Slug | source-company-jgwentworthhomelending |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-jgwentworthhomelending` for **JG Wentworth Home Lending** (US mortgage lender originating conventional, VA, and FHA home loans.). Sector:
Financial services / mortgage lending. HQ: Woodbridge, Virginia, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `JGWentworthHomeLendingLLC` (`https://jobs.smartrecruiters.com/JGWentworthHomeLendingLLC`),
which exposed **17 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-jgwentworthhomelending` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.JG_WENTWORTH_HOME_LENDING`** in the source
> registry, so that a single `siteType: [Site.JG_WENTWORTH_HOME_LENDING]` request returns
> JG Wentworth Home Lending's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.JG_WENTWORTH_HOME_LENDING = 'jgwentworthhomelending'` to the `Site` enum. | must |
| FR-2 | `JGWentworthHomeLendingService` implements `IScraper`, `@SourcePlugin({ site: Site.JG_WENTWORTH_HOME_LENDING, name: 'JG Wentworth Home Lending', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'JGWentworthHomeLendingLLC' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.JG_WENTWORTH_HOME_LENDING`, `companyName = 'JG Wentworth Home Lending'`, `id` prefix `sr-`→`jgwentworthhomelending-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Conventional, VA, and FHA loans
- Mortgage origination
- Multi-state licensing
- Part of The J.G. Wentworth Company
