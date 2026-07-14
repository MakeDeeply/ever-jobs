# Spec: 1564 — Source Company Plugin: Talan

| Field | Value |
| --- | --- |
| Spec ID | 1564 |
| Slug | source-company-talan |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-talan` for **Talan** (French consulting group focused on technology, data and business transformation.). Sector:
Technology & management consulting. HQ: Paris, France.

The company's live postings are served by **SmartRecruiters** on company
identifier `Talan` (`https://jobs.smartrecruiters.com/Talan`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-talan` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TALAN`** in the source
> registry, so that a single `siteType: [Site.TALAN]` request returns
> Talan's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TALAN = 'talan'` to the `Site` enum. | must |
| FR-2 | `TalanService` implements `IScraper`, `@SourcePlugin({ site: Site.TALAN, name: 'Talan', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Talan' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TALAN`, `companyName = 'Talan'`, `id` prefix `sr-`→`talan-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Headquartered in Paris, France
- Technology, data and transformation consulting
- Operations across Europe and the UK
- Enterprise advisory and implementation services
