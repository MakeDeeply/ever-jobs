# Spec: 1584 — Source Company Plugin: Vuori

| Field | Value |
| --- | --- |
| Spec ID | 1584 |
| Slug | source-company-vuori |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-vuori` for **Vuori** (Performance apparel brand selling activewear and athleisure through its own stores and e-commerce.). Sector:
Apparel & activewear (retail/e-commerce). HQ: Carlsbad, California, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `VuoriInc` (`https://jobs.smartrecruiters.com/VuoriInc`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-vuori` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.VUORI`** in the source
> registry, so that a single `siteType: [Site.VUORI]` request returns
> Vuori's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.VUORI = 'vuori'` to the `Site` enum. | must |
| FR-2 | `VuoriService` implements `IScraper`, `@SourcePlugin({ site: Site.VUORI, name: 'Vuori', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'VuoriInc' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.VUORI`, `companyName = 'Vuori'`, `id` prefix `sr-`→`vuori-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Direct-to-consumer apparel brand
- Owns physical retail stores plus e-commerce
- Headquartered in Carlsbad, California
- Expanding US and international store footprint
