# Spec: 1128 — Source Company Plugin: Common Room

| Field | Value |
| --- | --- |
| Spec ID | 1128 |
| Slug | source-company-commonroom |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-commonroom` for
**Common Room** (AI-native customer intelligence and go-to-market platform.). Sector: B2B SaaS / go-to-market software. HQ: Seattle, Washington, USA.

The company's live postings are served by **Ashby** on job board
`commonroom` (`https://jobs.ashbyhq.com/commonroom`), which exposed
**10 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-commonroom` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.COMMON_ROOM`** in the source
> registry, so that a single `siteType: [Site.COMMON_ROOM]` request returns
> Common Room's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.COMMON_ROOM = 'commonroom'` to the `Site` enum. | must |
| FR-2 | `CommonRoomService` implements `IScraper`, `@SourcePlugin({ site: Site.COMMON_ROOM, name: 'Common Room', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'commonroom' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.COMMON_ROOM`, `companyName = 'Common Room'`, `id` prefix `ashby-`→`commonroom-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Unifies customer data and buyer signals for GTM teams
- AI agents for research, enrichment, and prospecting
- Founded 2020, headquartered in Seattle
