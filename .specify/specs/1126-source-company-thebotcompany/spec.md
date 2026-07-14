# Spec: 1126 — Source Company Plugin: The Bot Company

| Field | Value |
| --- | --- |
| Spec ID | 1126 |
| Slug | source-company-thebotcompany |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-thebotcompany` for
**The Bot Company** (Develops household robots for consumers.). Sector: Robotics / Consumer hardware. HQ: San Francisco, California, USA.

The company's live postings are served by **Ashby** on job board
`thebotcompany` (`https://jobs.ashbyhq.com/thebotcompany`), which exposed
**11 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-thebotcompany` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.THE_BOT_COMPANY`** in the source
> registry, so that a single `siteType: [Site.THE_BOT_COMPANY]` request returns
> The Bot Company's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.THE_BOT_COMPANY = 'thebotcompany'` to the `Site` enum. | must |
| FR-2 | `TheBotCompanyService` implements `IScraper`, `@SourcePlugin({ site: Site.THE_BOT_COMPANY, name: 'The Bot Company', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'thebotcompany' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.THE_BOT_COMPANY`, `companyName = 'The Bot Company'`, `id` prefix `ashby-`→`thebotcompany-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Building a home robot
- Small in-person engineering team
- Based in San Francisco
