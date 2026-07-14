# Spec: 1303 — Source Company Plugin: Mistral AI

| Field | Value |
| --- | --- |
| Spec ID | 1303 |
| Slug | source-company-mistral |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-mistral` for
**Mistral AI** (Builds open-weight and commercial large language models and an enterprise AI platform.). Sector: AI / LLM foundation models. HQ: Paris, Ile-de-France, France.

The company's live postings are served by **Lever** on job board
`mistral` (`https://jobs.lever.co/mistral`), which exposed
**175 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-mistral` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MISTRAL_AI`** in the source
> registry, so that a single `siteType: [Site.MISTRAL_AI]` request returns
> Mistral AI's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MISTRAL_AI = 'mistral'` to the `Site` enum. | must |
| FR-2 | `MistralAIService` implements `IScraper`, `@SourcePlugin({ site: Site.MISTRAL_AI, name: 'Mistral AI', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'mistral' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MISTRAL_AI`, `companyName = 'Mistral AI'`, `id` prefix `lever-`→`mistral-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops open-weight and commercial large language models
- Offers an enterprise AI platform with on-premises and cloud deployment
- Has an Applied AI team working with enterprise and public-sector clients
- Distributed across France, USA, UK, Germany and Singapore
