# Spec: 1033 — Source Company Plugin: Encord

| Field | Value |
| --- | --- |
| Spec ID | 1033 |
| Slug | source-company-encord |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-encord` for
**Encord** (Data platform for training and evaluating AI models.). Sector: AI data infrastructure. HQ: San Francisco, California, USA.

The company's live postings are served by **Ashby** on job board
`encord` (`https://jobs.ashbyhq.com/encord`), which exposed
**50 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-encord` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ENCORD`** in the source
> registry, so that a single `siteType: [Site.ENCORD]` request returns
> Encord's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ENCORD = 'encord'` to the `Site` enum. | must |
| FR-2 | `EncordService` implements `IScraper`, `@SourcePlugin({ site: Site.ENCORD, name: 'Encord', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'encord' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ENCORD`, `companyName = 'Encord'`, `id` prefix `ashby-`→`encord-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Data annotation and curation platform for AI
- Supports multimodal training data
