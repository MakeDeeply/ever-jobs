# Spec: 1035 — Source Company Plugin: Cowboy Space Corp.

| Field | Value |
| --- | --- |
| Spec ID | 1035 |
| Slug | source-company-cowboyspacecorp |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-cowboyspacecorp` for
**Cowboy Space Corp.** (Develops satellites to collect solar energy in orbit and transmit it to Earth.). Sector: Space. HQ: USA.

The company's live postings are served by **Ashby** on job board
`cowboyspace` (`https://jobs.ashbyhq.com/cowboyspace`), which exposed
**49 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-cowboyspacecorp` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.COWBOY_SPACE_CORP`** in the source
> registry, so that a single `siteType: [Site.COWBOY_SPACE_CORP]` request returns
> Cowboy Space Corp.'s live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.COWBOY_SPACE_CORP = 'cowboyspacecorp'` to the `Site` enum. | must |
| FR-2 | `CowboySpaceCorpService` implements `IScraper`, `@SourcePlugin({ site: Site.COWBOY_SPACE_CORP, name: 'Cowboy Space Corp.', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'cowboyspace' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.COWBOY_SPACE_CORP`, `companyName = 'Cowboy Space Corp.'`, `id` prefix `ashby-`→`cowboyspacecorp-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Developing space-based solar power satellites
- Founded in 2024 by Baiju Bhatt
- Engineering across avionics, propulsion, and optical communications
