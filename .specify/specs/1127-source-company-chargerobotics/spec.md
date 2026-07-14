# Spec: 1127 — Source Company Plugin: Charge Robotics

| Field | Value |
| --- | --- |
| Spec ID | 1127 |
| Slug | source-company-chargerobotics |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-chargerobotics` for
**Charge Robotics** (Builds robotic systems that automate the construction of utility-scale solar farms.). Sector: Robotics / Renewable energy automation. HQ: San Leandro, California, USA.

The company's live postings are served by **Ashby** on job board
`charge-robotics` (`https://jobs.ashbyhq.com/charge-robotics`), which exposed
**10 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-chargerobotics` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CHARGE_ROBOTICS`** in the source
> registry, so that a single `siteType: [Site.CHARGE_ROBOTICS]` request returns
> Charge Robotics's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CHARGE_ROBOTICS = 'chargerobotics'` to the `Site` enum. | must |
| FR-2 | `ChargeRoboticsService` implements `IScraper`, `@SourcePlugin({ site: Site.CHARGE_ROBOTICS, name: 'Charge Robotics', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'charge-robotics' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CHARGE_ROBOTICS`, `companyName = 'Charge Robotics'`, `id` prefix `ashby-`→`chargerobotics-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Series A stage
- Robots automate solar farm construction
- HQ in San Leandro, CA with field operations in Phoenix, AZ
