# Spec: 1093 — Source Company Plugin: Dust

| Field | Value |
| --- | --- |
| Spec ID | 1093 |
| Slug | source-company-dust |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-dust` for
**Dust** (Platform for building and deploying AI agents connected to company data and tools.). Sector: B2B SaaS / AI collaboration software. HQ: Paris, France.

The company's live postings are served by **Ashby** on job board
`dust` (`https://jobs.ashbyhq.com/dust`), which exposed
**17 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-dust` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DUST`** in the source
> registry, so that a single `siteType: [Site.DUST]` request returns
> Dust's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DUST = 'dust'` to the `Site` enum. | must |
| FR-2 | `DustService` implements `IScraper`, `@SourcePlugin({ site: Site.DUST, name: 'Dust', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'dust' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DUST`, `companyName = 'Dust'`, `id` prefix `ashby-`→`dust-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Shared workspace for building and deploying AI agents
- Connects agents to company knowledge and tools
- Based in Paris
