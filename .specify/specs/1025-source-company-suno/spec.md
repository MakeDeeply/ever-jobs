# Spec: 1025 — Source Company Plugin: Suno

| Field | Value |
| --- | --- |
| Spec ID | 1025 |
| Slug | source-company-suno |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-suno` for
**Suno** (AI music generation platform that creates songs from text prompts.). Sector: Applied AI / music. HQ: Cambridge, Massachusetts, USA.

The company's live postings are served by **Ashby** on job board
`suno` (`https://jobs.ashbyhq.com/suno`), which exposed
**59 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-suno` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SUNO`** in the source
> registry, so that a single `siteType: [Site.SUNO]` request returns
> Suno's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SUNO = 'suno'` to the `Site` enum. | must |
| FR-2 | `SunoService` implements `IScraper`, `@SourcePlugin({ site: Site.SUNO, name: 'Suno', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'suno' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SUNO`, `companyName = 'Suno'`, `id` prefix `ashby-`→`suno-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Generative AI for full song creation from prompts
- Consumer web and mobile products
