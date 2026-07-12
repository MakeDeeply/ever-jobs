# Spec: 1498 — Source Company Plugin: Natixis in Portugal

| Field | Value |
| --- | --- |
| Spec ID | 1498 |
| Slug | source-company-natixisinportugal |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-natixisinportugal` for **Natixis in Portugal** (Center of expertise of Natixis (Groupe BPCE) supporting corporate and investment banking.). Sector:
Banking / corporate & investment banking. HQ: Porto, Portugal.

The company's live postings are served by **SmartRecruiters** on company
identifier `natixisinportugal` (`https://jobs.smartrecruiters.com/natixisinportugal`),
which exposed **79 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-natixisinportugal` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NATIXIS_IN_PORTUGAL`** in the source
> registry, so that a single `siteType: [Site.NATIXIS_IN_PORTUGAL]` request returns
> Natixis in Portugal's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NATIXIS_IN_PORTUGAL = 'natixisinportugal'` to the `Site` enum. | must |
| FR-2 | `NatixisInPortugalService` implements `IScraper`, `@SourcePlugin({ site: Site.NATIXIS_IN_PORTUGAL, name: 'Natixis in Portugal', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'natixisinportugal' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NATIXIS_IN_PORTUGAL`, `companyName = 'Natixis in Portugal'`, `id` prefix `sr-`→`natixisinportugal-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Corporate and investment banking support
- Technology and operations center
- Part of Groupe BPCE
- Based in Porto
