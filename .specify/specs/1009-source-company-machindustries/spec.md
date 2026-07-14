# Spec: 1009 — Source Company Plugin: Mach Industries

| Field | Value |
| --- | --- |
| Spec ID | 1009 |
| Slug | source-company-machindustries |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-machindustries` for
**Mach Industries** (Designs and manufactures defense hardware and weapons systems.). Sector: Defense. HQ: Huntington Beach, California, USA.

The company's live postings are served by **Ashby** on job board
`mach` (`https://jobs.ashbyhq.com/mach`), which exposed
**90 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-machindustries` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MACH_INDUSTRIES`** in the source
> registry, so that a single `siteType: [Site.MACH_INDUSTRIES]` request returns
> Mach Industries's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MACH_INDUSTRIES = 'machindustries'` to the `Site` enum. | must |
| FR-2 | `MachIndustriesService` implements `IScraper`, `@SourcePlugin({ site: Site.MACH_INDUSTRIES, name: 'Mach Industries', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'mach' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MACH_INDUSTRIES`, `companyName = 'Mach Industries'`, `id` prefix `ashby-`→`machindustries-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops defense hardware and weapons systems
- Vertically integrated engineering and manufacturing
- Focused on US and allied defense applications
