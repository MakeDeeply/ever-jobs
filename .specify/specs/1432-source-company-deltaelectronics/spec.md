# Spec: 1432 — Source Company Plugin: Delta Electronics

| Field | Value |
| --- | --- |
| Spec ID | 1432 |
| Slug | source-company-deltaelectronics |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-deltaelectronics` for **Delta Electronics** (Manufacturer of power supplies, industrial automation, and thermal management products.). Sector:
Industrial electronics / Power & automation. HQ: Taipei, Taiwan.

The company's live postings are served by **SmartRecruiters** on company
identifier `DeltaElectronics` (`https://jobs.smartrecruiters.com/DeltaElectronics`),
which exposed **57 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-deltaelectronics` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DELTA_ELECTRONICS`** in the source
> registry, so that a single `siteType: [Site.DELTA_ELECTRONICS]` request returns
> Delta Electronics's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DELTA_ELECTRONICS = 'deltaelectronics'` to the `Site` enum. | must |
| FR-2 | `DeltaElectronicsService` implements `IScraper`, `@SourcePlugin({ site: Site.DELTA_ELECTRONICS, name: 'Delta Electronics', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'DeltaElectronics' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DELTA_ELECTRONICS`, `companyName = 'Delta Electronics'`, `id` prefix `sr-`→`deltaelectronics-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Manufactures switching power supplies and thermal management products
- Business areas include industrial and building automation
- Founded in 1971 with global manufacturing operations
