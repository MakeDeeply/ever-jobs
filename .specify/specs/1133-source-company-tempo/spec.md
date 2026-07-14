# Spec: 1133 — Source Company Plugin: Tempo

| Field | Value |
| --- | --- |
| Spec ID | 1133 |
| Slug | source-company-tempo |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-tempo` for
**Tempo** (Layer-1 blockchain purpose-built for stablecoins and real-world payments.). Sector: Layer-1 blockchain / payments. HQ: Remote.

The company's live postings are served by **Ashby** on job board
`tempo-xyz` (`https://jobs.ashbyhq.com/tempo-xyz`), which exposed
**10 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-tempo` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TEMPO`** in the source
> registry, so that a single `siteType: [Site.TEMPO]` request returns
> Tempo's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TEMPO = 'tempo'` to the `Site` enum. | must |
| FR-2 | `TempoService` implements `IScraper`, `@SourcePlugin({ site: Site.TEMPO, name: 'Tempo', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'tempo-xyz' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TEMPO`, `companyName = 'Tempo'`, `id` prefix `ashby-`→`tempo-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Layer-1 blockchain for stablecoins
- Focused on real-world payments
- Builds blockchain payment infrastructure
