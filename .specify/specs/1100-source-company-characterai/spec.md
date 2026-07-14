# Spec: 1100 — Source Company Plugin: Character.AI

| Field | Value |
| --- | --- |
| Spec ID | 1100 |
| Slug | source-company-characterai |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-characterai` for
**Character.AI** (Consumer platform for creating and chatting with AI characters.). Sector: Applied AI / consumer. HQ: Menlo Park, California, USA.

The company's live postings are served by **Ashby** on job board
`character` (`https://jobs.ashbyhq.com/character`), which exposed
**16 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-characterai` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CHARACTER_AI`** in the source
> registry, so that a single `siteType: [Site.CHARACTER_AI]` request returns
> Character.AI's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CHARACTER_AI = 'characterai'` to the `Site` enum. | must |
| FR-2 | `CharacterAIService` implements `IScraper`, `@SourcePlugin({ site: Site.CHARACTER_AI, name: 'Character.AI', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'character' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CHARACTER_AI`, `companyName = 'Character.AI'`, `id` prefix `ashby-`→`characterai-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Consumer app for user-created conversational AI characters
- Available on web and mobile platforms
