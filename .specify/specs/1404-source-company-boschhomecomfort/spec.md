# Spec: 1404 — Source Company Plugin: Bosch Home Comfort

| Field | Value |
| --- | --- |
| Spec ID | 1404 |
| Slug | source-company-boschhomecomfort |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-boschhomecomfort` for **Bosch Home Comfort** (Bosch division manufacturing heating, ventilation, and hot water systems for residential and commercial use.). Sector:
Industrial / HVAC & heating equipment. HQ: Wetzlar, Hesse, Germany.

The company's live postings are served by **SmartRecruiters** on company
identifier `Bosch-HomeComfort` (`https://jobs.smartrecruiters.com/Bosch-HomeComfort`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-boschhomecomfort` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.BOSCH_HOME_COMFORT`** in the source
> registry, so that a single `siteType: [Site.BOSCH_HOME_COMFORT]` request returns
> Bosch Home Comfort's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.BOSCH_HOME_COMFORT = 'boschhomecomfort'` to the `Site` enum. | must |
| FR-2 | `BoschHomeComfortService` implements `IScraper`, `@SourcePlugin({ site: Site.BOSCH_HOME_COMFORT, name: 'Bosch Home Comfort', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Bosch-HomeComfort' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.BOSCH_HOME_COMFORT`, `companyName = 'Bosch Home Comfort'`, `id` prefix `sr-`→`boschhomecomfort-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Manufactures heat pumps, boilers, and water heaters
- Part of the Bosch Energy and Building Technology sector
- Operates production sites across Europe and North America
