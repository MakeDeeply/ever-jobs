# Spec: 1541 — Source Company Plugin: Shaw's

| Field | Value |
| --- | --- |
| Spec ID | 1541 |
| Slug | source-company-shaws |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-shaws` for **Shaw's** (New England supermarket chain and part of the Albertsons family of grocery stores.). Sector:
Grocery retail (supermarkets). HQ: West Bridgewater, Massachusetts, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `Shaws` (`https://jobs.smartrecruiters.com/Shaws`),
which exposed **38 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-shaws` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SHAW_S`** in the source
> registry, so that a single `siteType: [Site.SHAW_S]` request returns
> Shaw's's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SHAW_S = 'shaws'` to the `Site` enum. | must |
| FR-2 | `ShawSService` implements `IScraper`, `@SourcePlugin({ site: Site.SHAW_S, name: 'Shaw's', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Shaws' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SHAW_S`, `companyName = 'Shaw's'`, `id` prefix `sr-`→`shaws-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- New England supermarket chain
- Part of Albertsons Companies
- Full-service grocery, pharmacy, and household goods
- Long-established US grocery brand
