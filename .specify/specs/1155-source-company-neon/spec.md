# Spec: 1155 — Source Company Plugin: Neon

| Field | Value |
| --- | --- |
| Spec ID | 1155 |
| Slug | source-company-neon |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-neon` for
**Neon** (Serverless Postgres database with branching and autoscaling.). Sector: Databases / Data infrastructure. HQ: San Francisco, California, USA.

The company's live postings are served by **Ashby** on job board
`neon` (`https://jobs.ashbyhq.com/neon`), which exposed
**7 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-neon` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NEON`** in the source
> registry, so that a single `siteType: [Site.NEON]` request returns
> Neon's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NEON = 'neon'` to the `Site` enum. | must |
| FR-2 | `NeonService` implements `IScraper`, `@SourcePlugin({ site: Site.NEON, name: 'Neon', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'neon' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NEON`, `companyName = 'Neon'`, `id` prefix `ashby-`→`neon-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Serverless Postgres platform
- Database branching and autoscaling
- Separates storage and compute
