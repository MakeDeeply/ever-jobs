# Spec: 1134 — Source Company Plugin: ZeroMark

| Field | Value |
| --- | --- |
| Spec ID | 1134 |
| Slug | source-company-zeromark |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-zeromark` for
**ZeroMark** (Builds a rifle-mounted, software-defined counter-drone aiming system.). Sector: Defense (Counter-UAS). HQ: New York, USA.

The company's live postings are served by **Ashby** on job board
`zeromark` (`https://jobs.ashbyhq.com/zeromark`), which exposed
**10 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-zeromark` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ZEROMARK`** in the source
> registry, so that a single `siteType: [Site.ZEROMARK]` request returns
> ZeroMark's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ZEROMARK = 'zeromark'` to the `Site` enum. | must |
| FR-2 | `ZeroMarkService` implements `IScraper`, `@SourcePlugin({ site: Site.ZEROMARK, name: 'ZeroMark', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'zeromark' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ZEROMARK`, `companyName = 'ZeroMark'`, `id` prefix `ashby-`→`zeromark-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops rifle-mounted counter-drone aiming system
- Combines computer vision and precision robotics
- Founded in 2022; system tested with US Marines
