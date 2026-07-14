# Spec: 982 — Source Company Plugin: Applied Intuition

| Field | Value |
| --- | --- |
| Spec ID | 982 |
| Slug | source-company-appliedintuition |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-appliedintuition` for
**Applied Intuition** (Provides software for developing, testing, and deploying autonomous systems across automotive and defense.). Sector: Defense & Autonomy. HQ: Mountain View, California, USA.

The company's live postings are served by **Ashby** on job board
`applied` (`https://jobs.ashbyhq.com/applied`), which exposed
**248 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-appliedintuition` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.APPLIED_INTUITION`** in the source
> registry, so that a single `siteType: [Site.APPLIED_INTUITION]` request returns
> Applied Intuition's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.APPLIED_INTUITION = 'appliedintuition'` to the `Site` enum. | must |
| FR-2 | `AppliedIntuitionService` implements `IScraper`, `@SourcePlugin({ site: Site.APPLIED_INTUITION, name: 'Applied Intuition', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'applied' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.APPLIED_INTUITION`, `companyName = 'Applied Intuition'`, `id` prefix `ashby-`→`appliedintuition-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Develops simulation and validation software for autonomous systems
- Operates a Government/defense autonomy product line
- Products span automotive, commercial, and defense sectors
