# Spec: 1570 — Source Company Plugin: Transat AT

| Field | Value |
| --- | --- |
| Spec ID | 1570 |
| Slug | source-company-transatat |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-transatat` for **Transat AT** (Canadian travel company operating Air Transat and holiday travel packages.). Sector:
Travel & Airlines. HQ: Montreal, Quebec, Canada.

The company's live postings are served by **SmartRecruiters** on company
identifier `TransatAT1` (`https://jobs.smartrecruiters.com/TransatAT1`),
which exposed **45 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-transatat` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TRANSAT_AT`** in the source
> registry, so that a single `siteType: [Site.TRANSAT_AT]` request returns
> Transat AT's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TRANSAT_AT = 'transatat'` to the `Site` enum. | must |
| FR-2 | `TransatATService` implements `IScraper`, `@SourcePlugin({ site: Site.TRANSAT_AT, name: 'Transat AT', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'TransatAT1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TRANSAT_AT`, `companyName = 'Transat AT'`, `id` prefix `sr-`→`transatat-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Operates Air Transat
- Leisure travel and vacation packages
- Headquartered in Montreal, Canada
