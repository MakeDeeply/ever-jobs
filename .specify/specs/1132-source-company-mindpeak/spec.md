# Spec: 1132 — Source Company Plugin: Mindpeak

| Field | Value |
| --- | --- |
| Spec ID | 1132 |
| Slug | source-company-mindpeak |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-mindpeak` for
**Mindpeak** (AI software for cancer diagnostics in pathology.). Sector: Healthtech (AI pathology / diagnostics). HQ: Hamburg, Germany.

The company's live postings are served by **Ashby** on job board
`mindpeak` (`https://jobs.ashbyhq.com/mindpeak`), which exposed
**10 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-mindpeak` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MINDPEAK`** in the source
> registry, so that a single `siteType: [Site.MINDPEAK]` request returns
> Mindpeak's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MINDPEAK = 'mindpeak'` to the `Site` enum. | must |
| FR-2 | `MindpeakService` implements `IScraper`, `@SourcePlugin({ site: Site.MINDPEAK, name: 'Mindpeak', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'mindpeak' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MINDPEAK`, `companyName = 'Mindpeak'`, `id` prefix `ashby-`→`mindpeak-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- AI software for digital pathology
- Supports cancer diagnostic workflows
- Based in Hamburg, Germany
