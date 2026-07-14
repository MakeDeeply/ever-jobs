# Spec: 1050 — Source Company Plugin: Antares (Antares Industries)

| Field | Value |
| --- | --- |
| Spec ID | 1050 |
| Slug | source-company-antaresantaresindustries |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-antaresantaresindustries` for
**Antares (Antares Industries)** (Builds factory-produced fission microreactors for strategic energy on Earth and in space.). Sector: Nuclear (Defense & Space Power). HQ: USA.

The company's live postings are served by **Ashby** on job board
`antares` (`https://jobs.ashbyhq.com/antares`), which exposed
**34 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-antaresantaresindustries` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ANTARES_ANTARES_INDUSTRIES`** in the source
> registry, so that a single `siteType: [Site.ANTARES_ANTARES_INDUSTRIES]` request returns
> Antares (Antares Industries)'s live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ANTARES_ANTARES_INDUSTRIES = 'antaresantaresindustries'` to the `Site` enum. | must |
| FR-2 | `AntaresAntaresIndustriesService` implements `IScraper`, `@SourcePlugin({ site: Site.ANTARES_ANTARES_INDUSTRIES, name: 'Antares (Antares Industries)', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'antares' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ANTARES_ANTARES_INDUSTRIES`, `companyName = 'Antares (Antares Industries)'`, `id` prefix `ashby-`→`antaresantaresindustries-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Factory-produced fission microreactor design
- Contracts with US Air Force, Space Force, and NASA
- First private company to reach criticality under the DOE Reactor Pilot Program
