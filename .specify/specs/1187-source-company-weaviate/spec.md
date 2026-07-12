# Spec: 1187 — Source Company Plugin: Weaviate

| Field | Value |
| --- | --- |
| Spec ID | 1187 |
| Slug | source-company-weaviate |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-weaviate` for
**Weaviate** (AI-native open-source vector database for unstructured data.). Sector: Databases / Vector Database. HQ: Amsterdam, North Holland, Netherlands.

The company's live postings are served by **Ashby** on job board
`weaviate` (`https://jobs.ashbyhq.com/weaviate`), which exposed
**4 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-weaviate` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.WEAVIATE`** in the source
> registry, so that a single `siteType: [Site.WEAVIATE]` request returns
> Weaviate's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.WEAVIATE = 'weaviate'` to the `Site` enum. | must |
| FR-2 | `WeaviateService` implements `IScraper`, `@SourcePlugin({ site: Site.WEAVIATE, name: 'Weaviate', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'weaviate' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.WEAVIATE`, `companyName = 'Weaviate'`, `id` prefix `ashby-`→`weaviate-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Open-source AI-native vector database
- Managed cloud offering for vector search
- Roles in Growth, Product, and Applied Research
