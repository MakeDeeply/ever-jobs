# Spec: 1159 — Source Company Plugin: Reality Defender

| Field | Value |
| --- | --- |
| Spec ID | 1159 |
| Slug | source-company-realitydefender |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-realitydefender` for
**Reality Defender** (Multi-modal AI-generated media and deepfake detection platform.). Sector: Deepfake Detection & Fraud. HQ: New York, New York, United States.

The company's live postings are served by **Ashby** on job board
`realitydefender` (`https://jobs.ashbyhq.com/realitydefender`), which exposed
**7 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-realitydefender` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.REALITY_DEFENDER`** in the source
> registry, so that a single `siteType: [Site.REALITY_DEFENDER]` request returns
> Reality Defender's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.REALITY_DEFENDER = 'realitydefender'` to the `Site` enum. | must |
| FR-2 | `RealityDefenderService` implements `IScraper`, `@SourcePlugin({ site: Site.REALITY_DEFENDER, name: 'Reality Defender', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'realitydefender' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.REALITY_DEFENDER`, `companyName = 'Reality Defender'`, `id` prefix `ashby-`→`realitydefender-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Multi-modal deepfake and AI-media detection
- Targets fraud and disinformation prevention
- Y Combinator graduate, backed by DCVC
