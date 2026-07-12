# Spec: 1101 — Source Company Plugin: Foundry Robotics

| Field | Value |
| --- | --- |
| Spec ID | 1101 |
| Slug | source-company-foundryrobotics |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-foundryrobotics` for
**Foundry Robotics** (Builds AI-powered robotic manufacturing systems for robotics and hardware production.). Sector: Robotics / Manufacturing automation. HQ: San Francisco, California, USA.

The company's live postings are served by **Ashby** on job board
`foundry-robotics` (`https://jobs.ashbyhq.com/foundry-robotics`), which exposed
**16 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-foundryrobotics` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FOUNDRY_ROBOTICS`** in the source
> registry, so that a single `siteType: [Site.FOUNDRY_ROBOTICS]` request returns
> Foundry Robotics's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FOUNDRY_ROBOTICS = 'foundryrobotics'` to the `Site` enum. | must |
| FR-2 | `FoundryRoboticsService` implements `IScraper`, `@SourcePlugin({ site: Site.FOUNDRY_ROBOTICS, name: 'Foundry Robotics', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'foundry-robotics' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FOUNDRY_ROBOTICS`, `companyName = 'Foundry Robotics'`, `id` prefix `ashby-`→`foundryrobotics-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- AI-first robotic manufacturing
- On-site in San Francisco
- Focus on dual-use hardware production
