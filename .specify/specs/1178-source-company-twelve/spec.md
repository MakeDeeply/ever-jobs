# Spec: 1178 — Source Company Plugin: Twelve

| Field | Value |
| --- | --- |
| Spec ID | 1178 |
| Slug | source-company-twelve |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-twelve` for
**Twelve** (Uses carbon transformation technology to turn CO2 into fuels, chemicals, and materials.). Sector: Carbon transformation. HQ: Berkeley, California, USA.

The company's live postings are served by **Ashby** on job board
`twelve` (`https://jobs.ashbyhq.com/twelve`), which exposed
**5 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-twelve` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TWELVE`** in the source
> registry, so that a single `siteType: [Site.TWELVE]` request returns
> Twelve's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TWELVE = 'twelve'` to the `Site` enum. | must |
| FR-2 | `TwelveService` implements `IScraper`, `@SourcePlugin({ site: Site.TWELVE, name: 'Twelve', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'twelve' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TWELVE`, `companyName = 'Twelve'`, `id` prefix `ashby-`→`twelve-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Converts CO2 into fuels, chemicals, and materials via electrochemistry
- Produces sustainable aviation fuel from carbon dioxide
- Focused on reducing reliance on fossil-based feedstocks
- Headquartered in Berkeley, California
