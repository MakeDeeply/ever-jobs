# Spec: 980 — Source Company Plugin: Harvey

| Field | Value |
| --- | --- |
| Spec ID | 980 |
| Slug | source-company-harvey |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-harvey` for
**Harvey** (AI platform for legal and professional-services work.). Sector: Applied AI / legal. HQ: San Francisco, California, USA.

The company's live postings are served by **Ashby** on job board
`harvey` (`https://jobs.ashbyhq.com/harvey`), which exposed
**321 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-harvey` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HARVEY`** in the source
> registry, so that a single `siteType: [Site.HARVEY]` request returns
> Harvey's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HARVEY = 'harvey'` to the `Site` enum. | must |
| FR-2 | `HarveyService` implements `IScraper`, `@SourcePlugin({ site: Site.HARVEY, name: 'Harvey', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'harvey' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HARVEY`, `companyName = 'Harvey'`, `id` prefix `ashby-`→`harvey-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- AI platform focused on legal and professional-services workflows
- Serves law firms and enterprise legal teams
