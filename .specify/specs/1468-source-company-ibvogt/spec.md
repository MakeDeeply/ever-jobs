# Spec: 1468 — Source Company Plugin: ib vogt

| Field | Value |
| --- | --- |
| Spec ID | 1468 |
| Slug | source-company-ibvogt |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-ibvogt` for **ib vogt** (Global developer of turnkey utility-scale solar PV and battery storage projects.). Sector:
Solar & Storage Development. HQ: Berlin, Berlin, Germany.

The company's live postings are served by **SmartRecruiters** on company
identifier `ib-vogt-GmbH` (`https://jobs.smartrecruiters.com/ib-vogt-GmbH`),
which exposed **51 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-ibvogt` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.IB_VOGT`** in the source
> registry, so that a single `siteType: [Site.IB_VOGT]` request returns
> ib vogt's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.IB_VOGT = 'ibvogt'` to the `Site` enum. | must |
| FR-2 | `IbVogtService` implements `IScraper`, `@SourcePlugin({ site: Site.IB_VOGT, name: 'ib vogt', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ib-vogt-GmbH' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.IB_VOGT`, `companyName = 'ib vogt'`, `id` prefix `sr-`→`ibvogt-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Turnkey utility-scale solar PV plants
- Battery energy storage projects
- Development, EPC and O&M services
- Headquartered in Berlin, Germany
