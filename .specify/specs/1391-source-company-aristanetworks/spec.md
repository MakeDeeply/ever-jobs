# Spec: 1391 — Source Company Plugin: Arista Networks

| Field | Value |
| --- | --- |
| Spec ID | 1391 |
| Slug | source-company-aristanetworks |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-aristanetworks` for **Arista Networks** (Provider of cloud and data-center networking solutions.). Sector:
Networking technology / software-driven networking. HQ: Santa Clara, California, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `aristanetworks` (`https://jobs.smartrecruiters.com/aristanetworks`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-aristanetworks` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ARISTA_NETWORKS`** in the source
> registry, so that a single `siteType: [Site.ARISTA_NETWORKS]` request returns
> Arista Networks's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ARISTA_NETWORKS = 'aristanetworks'` to the `Site` enum. | must |
| FR-2 | `AristaNetworksService` implements `IScraper`, `@SourcePlugin({ site: Site.ARISTA_NETWORKS, name: 'Arista Networks', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'aristanetworks' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ARISTA_NETWORKS`, `companyName = 'Arista Networks'`, `id` prefix `sr-`→`aristanetworks-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Data-center and cloud networking switches
- EOS network operating system
- Network software and automation
- Publicly traded (NYSE: ANET)
