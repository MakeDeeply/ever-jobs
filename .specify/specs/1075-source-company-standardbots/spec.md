# Spec: 1075 — Source Company Plugin: Standard Bots

| Field | Value |
| --- | --- |
| Spec ID | 1075 |
| Slug | source-company-standardbots |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-standardbots` for
**Standard Bots** (Builds AI-powered six-axis robotic arms for industrial automation.). Sector: Industrial automation / Robotics. HQ: Glen Cove, New York, USA.

The company's live postings are served by **Ashby** on job board
`standardbots` (`https://jobs.ashbyhq.com/standardbots`), which exposed
**25 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-standardbots` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.STANDARD_BOTS`** in the source
> registry, so that a single `siteType: [Site.STANDARD_BOTS]` request returns
> Standard Bots's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.STANDARD_BOTS = 'standardbots'` to the `Site` enum. | must |
| FR-2 | `StandardBotsService` implements `IScraper`, `@SourcePlugin({ site: Site.STANDARD_BOTS, name: 'Standard Bots', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'standardbots' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.STANDARD_BOTS`, `companyName = 'Standard Bots'`, `id` prefix `ashby-`→`standardbots-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- AI-powered six-axis robot arm (RO1)
- Vertically integrated robotics
- New York-based
