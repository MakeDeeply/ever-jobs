# Spec: 1130 — Source Company Plugin: Fiddler AI

| Field | Value |
| --- | --- |
| Spec ID | 1130 |
| Slug | source-company-fiddlerai |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-fiddlerai` for
**Fiddler AI** (AI observability and model monitoring platform.). Sector: AI Observability. HQ: Palo Alto, California, USA.

The company's live postings are served by **Ashby** on job board
`fiddler-ai` (`https://jobs.ashbyhq.com/fiddler-ai`), which exposed
**10 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-fiddlerai` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.FIDDLER_AI`** in the source
> registry, so that a single `siteType: [Site.FIDDLER_AI]` request returns
> Fiddler AI's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.FIDDLER_AI = 'fiddlerai'` to the `Site` enum. | must |
| FR-2 | `FiddlerAIService` implements `IScraper`, `@SourcePlugin({ site: Site.FIDDLER_AI, name: 'Fiddler AI', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'fiddler-ai' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.FIDDLER_AI`, `companyName = 'Fiddler AI'`, `id` prefix `ashby-`→`fiddlerai-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- AI observability and model monitoring platform
- Focus on model explainability and analysis
- Roles across Engineering, Marketing, and Customer Success
