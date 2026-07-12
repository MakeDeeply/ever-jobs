# Spec: 1249 — Source Company Plugin: Field AI

| Field | Value |
| --- | --- |
| Spec ID | 1249 |
| Slug | source-company-fieldai |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-fieldai` for
**Field AI** (Builds field and dynamics foundation models for robots operating in the real world.). Sector: AI / robotics foundation models. HQ: Irvine, California, USA.

The company's live postings are served by **Lever** on job board
`field-ai` (`https://jobs.lever.co/field-ai`), which exposed
**100 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-fieldai` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FIELD_AI`** in the source
> registry, so that a single `siteType: [Site.FIELD_AI]` request returns
> Field AI's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FIELD_AI = 'fieldai'` to the `Site` enum. | must |
| FR-2 | `FieldAIService` implements `IScraper`, `@SourcePlugin({ site: Site.FIELD_AI, name: 'Field AI', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'field-ai' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FIELD_AI`, `companyName = 'Field AI'`, `id` prefix `lever-`→`fieldai-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops robotics field and dynamics foundation models
- Roles span humanoid manipulation, HRI and robotics AI
- Locations in Irvine, CA and Boston, MA
- Focused on real-world autonomous robots
