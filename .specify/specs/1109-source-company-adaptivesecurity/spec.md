# Spec: 1109 — Source Company Plugin: Adaptive Security

| Field | Value |
| --- | --- |
| Spec ID | 1109 |
| Slug | source-company-adaptivesecurity |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-adaptivesecurity` for
**Adaptive Security** (AI-powered cybersecurity platform defending against deepfakes and AI-driven social engineering.). Sector: AI Cybersecurity. HQ: New York, New York, United States.

The company's live postings are served by **Ashby** on job board
`adaptivesecurity` (`https://jobs.ashbyhq.com/adaptivesecurity`), which exposed
**13 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-adaptivesecurity` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ADAPTIVE_SECURITY`** in the source
> registry, so that a single `siteType: [Site.ADAPTIVE_SECURITY]` request returns
> Adaptive Security's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ADAPTIVE_SECURITY = 'adaptivesecurity'` to the `Site` enum. | must |
| FR-2 | `AdaptiveSecurityService` implements `IScraper`, `@SourcePlugin({ site: Site.ADAPTIVE_SECURITY, name: 'Adaptive Security', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'adaptivesecurity' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ADAPTIVE_SECURITY`, `companyName = 'Adaptive Security'`, `id` prefix `ashby-`→`adaptivesecurity-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Defends against deepfakes and AI social-engineering attacks
- Integrates with Google Workspace and Microsoft 365
- Raised an $81M Series B in December 2025
