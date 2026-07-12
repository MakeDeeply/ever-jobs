# Spec: 1629 — Source Company Plugin: Learned

| Field | Value |
| --- | --- |
| Spec ID | 1629 |
| Slug | source-company-learned |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-learned` for **Learned** (HR software platform for performance management, reviews, and employee development.). Sector:
HR-tech SaaS. HQ: Utrecht, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`learned` (`https://learned.recruitee.com`), which exposed
**11 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-learned` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LEARNED`** in the source
> registry, so that a single `siteType: [Site.LEARNED]` request returns
> Learned's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LEARNED = 'learned'` to the `Site` enum. | must |
| FR-2 | `LearnedService` implements `IScraper`, `@SourcePlugin({ site: Site.LEARNED, name: 'Learned', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'learned' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LEARNED`, `companyName = 'Learned'`, `id` prefix `recruitee-`→`learned-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Utrecht-based HR-tech SaaS
- Performance management and employee development platform
- Recruitee board learned.recruitee.com verified
