# Spec: 1000 — Source Company Plugin: TRM Labs

| Field | Value |
| --- | --- |
| Spec ID | 1000 |
| Slug | source-company-trmlabs |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-trmlabs` for
**TRM Labs** (Blockchain intelligence platform for detecting and investigating crypto-related crime.). Sector: Blockchain intelligence / risk. HQ: San Francisco, California, United States.

The company's live postings are served by **Ashby** on job board
`trm-labs` (`https://jobs.ashbyhq.com/trm-labs`), which exposed
**113 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-trmlabs` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TRM_LABS`** in the source
> registry, so that a single `siteType: [Site.TRM_LABS]` request returns
> TRM Labs's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TRM_LABS = 'trmlabs'` to the `Site` enum. | must |
| FR-2 | `TRMLabsService` implements `IScraper`, `@SourcePlugin({ site: Site.TRM_LABS, name: 'TRM Labs', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'trm-labs' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TRM_LABS`, `companyName = 'TRM Labs'`, `id` prefix `ashby-`→`trmlabs-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Delivers blockchain intelligence and analytics
- Supports fraud and threat investigation
- Serves financial institutions and public agencies
