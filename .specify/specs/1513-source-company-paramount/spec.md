# Spec: 1513 — Source Company Plugin: Paramount

| Field | Value |
| --- | --- |
| Spec ID | 1513 |
| Slug | source-company-paramount |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-paramount` for **Paramount** (US media and entertainment company spanning film, television and streaming.). Sector:
Media & Entertainment. HQ: New York, New York, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `ParamountATL` (`https://jobs.smartrecruiters.com/ParamountATL`),
which exposed **6 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-paramount` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PARAMOUNT`** in the source
> registry, so that a single `siteType: [Site.PARAMOUNT]` request returns
> Paramount's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PARAMOUNT = 'paramount'` to the `Site` enum. | must |
| FR-2 | `ParamountService` implements `IScraper`, `@SourcePlugin({ site: Site.PARAMOUNT, name: 'Paramount', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ParamountATL' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PARAMOUNT`, `companyName = 'Paramount'`, `id` prefix `sr-`→`paramount-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- US media and entertainment company
- Film, television and streaming operations
- Owns broadcast and cable networks
- Roles across corporate and operations
