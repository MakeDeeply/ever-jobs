# Spec: 1471 — Source Company Plugin: Iliad / Free

| Field | Value |
| --- | --- |
| Spec ID | 1471 |
| Slug | source-company-iliadfree |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-iliadfree` for **Iliad / Free** (French telecommunications operator providing mobile and fixed connectivity.). Sector:
Telecommunications. HQ: Paris, France.

The company's live postings are served by **SmartRecruiters** on company
identifier `Iliad-Free` (`https://jobs.smartrecruiters.com/Iliad-Free`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-iliadfree` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ILIAD_FREE`** in the source
> registry, so that a single `siteType: [Site.ILIAD_FREE]` request returns
> Iliad / Free's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ILIAD_FREE = 'iliadfree'` to the `Site` enum. | must |
| FR-2 | `IliadFreeService` implements `IScraper`, `@SourcePlugin({ site: Site.ILIAD_FREE, name: 'Iliad / Free', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Iliad-Free' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ILIAD_FREE`, `companyName = 'Iliad / Free'`, `id` prefix `sr-`→`iliadfree-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- HQ in Paris, France
- Operates the Free mobile and broadband brand
- Includes IT, cloud and data-center activities
- Hiring across engineering and business functions
