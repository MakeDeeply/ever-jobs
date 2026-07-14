# Spec: 1480 — Source Company Plugin: KIPP

| Field | Value |
| --- | --- |
| Spec ID | 1480 |
| Slug | source-company-kipp |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-kipp` for **KIPP** (National non-profit network of tuition-free, open-enrollment public charter schools.). Sector:
Education (K-12 public charter schools / non-profit). HQ: New York, New York, USA (national office).

The company's live postings are served by **SmartRecruiters** on company
identifier `KIPP` (`https://jobs.smartrecruiters.com/KIPP`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-kipp` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.KIPP`** in the source
> registry, so that a single `siteType: [Site.KIPP]` request returns
> KIPP's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.KIPP = 'kipp'` to the `Site` enum. | must |
| FR-2 | `KIPPService` implements `IScraper`, `@SourcePlugin({ site: Site.KIPP, name: 'KIPP', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'KIPP' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.KIPP`, `companyName = 'KIPP'`, `id` prefix `sr-`→`kipp-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- National public charter school network
- Tuition-free, open-enrollment schools
- K-12 college-preparatory model
- Non-profit organization
