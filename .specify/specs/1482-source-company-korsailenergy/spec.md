# Spec: 1482 — Source Company Plugin: Korsail Energy

| Field | Value |
| --- | --- |
| Spec ID | 1482 |
| Slug | source-company-korsailenergy |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-korsailenergy` for **Korsail Energy** (Developer of utility-scale solar and energy storage projects in the United States.). Sector:
Solar & Storage Development. HQ: Denver, Colorado, United States.

The company's live postings are served by **SmartRecruiters** on company
identifier `KorsailEnergy` (`https://jobs.smartrecruiters.com/KorsailEnergy`),
which exposed **3 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-korsailenergy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.KORSAIL_ENERGY`** in the source
> registry, so that a single `siteType: [Site.KORSAIL_ENERGY]` request returns
> Korsail Energy's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.KORSAIL_ENERGY = 'korsailenergy'` to the `Site` enum. | must |
| FR-2 | `KorsailEnergyService` implements `IScraper`, `@SourcePlugin({ site: Site.KORSAIL_ENERGY, name: 'Korsail Energy', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'KorsailEnergy' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.KORSAIL_ENERGY`, `companyName = 'Korsail Energy'`, `id` prefix `sr-`→`korsailenergy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Utility-scale solar project development
- Battery energy storage projects
- End-to-end project development
- Headquartered in Denver, Colorado
