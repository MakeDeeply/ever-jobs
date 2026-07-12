# Spec: 1489 — Source Company Plugin: LVMH Perfumes & Cosmetics

| Field | Value |
| --- | --- |
| Spec ID | 1489 |
| Slug | source-company-lvmhperfumescosmetics |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-lvmhperfumescosmetics` for **LVMH Perfumes & Cosmetics** (Perfumes and cosmetics division of luxury group LVMH, spanning multiple beauty brands.). Sector:
Beauty & cosmetics (consumer goods). HQ: Paris, France.

The company's live postings are served by **SmartRecruiters** on company
identifier `lvmhperfumescosmetics` (`https://jobs.smartrecruiters.com/lvmhperfumescosmetics`),
which exposed **81 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-lvmhperfumescosmetics` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LVMH_PERFUMES_COSMETICS`** in the source
> registry, so that a single `siteType: [Site.LVMH_PERFUMES_COSMETICS]` request returns
> LVMH Perfumes & Cosmetics's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LVMH_PERFUMES_COSMETICS = 'lvmhperfumescosmetics'` to the `Site` enum. | must |
| FR-2 | `LVMHPerfumesCosmeticsService` implements `IScraper`, `@SourcePlugin({ site: Site.LVMH_PERFUMES_COSMETICS, name: 'LVMH Perfumes & Cosmetics', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'lvmhperfumescosmetics' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LVMH_PERFUMES_COSMETICS`, `companyName = 'LVMH Perfumes & Cosmetics'`, `id` prefix `sr-`→`lvmhperfumescosmetics-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Beauty division of the LVMH group
- Perfume, makeup, and skincare houses
- Global retail and e-commerce distribution
- Headquartered in Paris, France
