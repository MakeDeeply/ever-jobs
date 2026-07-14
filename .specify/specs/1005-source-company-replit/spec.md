# Spec: 1005 — Source Company Plugin: Replit

| Field | Value |
| --- | --- |
| Spec ID | 1005 |
| Slug | source-company-replit |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-replit` for
**Replit** (Browser-based coding platform with AI-assisted development.). Sector: Applied AI / developer tools. HQ: San Francisco, California, USA.

The company's live postings are served by **Ashby** on job board
`replit` (`https://jobs.ashbyhq.com/replit`), which exposed
**98 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-replit` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.REPLIT`** in the source
> registry, so that a single `siteType: [Site.REPLIT]` request returns
> Replit's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.REPLIT = 'replit'` to the `Site` enum. | must |
| FR-2 | `ReplitService` implements `IScraper`, `@SourcePlugin({ site: Site.REPLIT, name: 'Replit', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'replit' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.REPLIT`, `companyName = 'Replit'`, `id` prefix `ashby-`→`replit-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Browser-based development environment
- AI-assisted app building and deployment
