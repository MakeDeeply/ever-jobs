# Spec: 1533 — Source Company Plugin: Salomon

| Field | Value |
| --- | --- |
| Spec ID | 1533 |
| Slug | source-company-salomon |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-salomon` for **Salomon** (Outdoor sports brand producing footwear, apparel, and equipment, part of Amer Sports.). Sector:
Sporting goods & outdoor apparel/footwear. HQ: Annecy, France.

The company's live postings are served by **SmartRecruiters** on company
identifier `Salomon` (`https://jobs.smartrecruiters.com/Salomon`),
which exposed **56 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-salomon` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SALOMON`** in the source
> registry, so that a single `siteType: [Site.SALOMON]` request returns
> Salomon's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SALOMON = 'salomon'` to the `Site` enum. | must |
| FR-2 | `SalomonService` implements `IScraper`, `@SourcePlugin({ site: Site.SALOMON, name: 'Salomon', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Salomon' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SALOMON`, `companyName = 'Salomon'`, `id` prefix `sr-`→`salomon-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Founded 1947 in the French Alps
- Owned by Amer Sports
- Footwear, apparel, and outdoor equipment
- Operates branded retail stores internationally
