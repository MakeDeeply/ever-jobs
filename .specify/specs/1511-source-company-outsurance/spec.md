# Spec: 1511 — Source Company Plugin: OUTsurance

| Field | Value |
| --- | --- |
| Spec ID | 1511 |
| Slug | source-company-outsurance |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-outsurance` for **OUTsurance** (South African short-term and life insurer selling direct and through brokers.). Sector:
Insurance. HQ: Centurion, Gauteng, South Africa.

The company's live postings are served by **SmartRecruiters** on company
identifier `OUTsurance` (`https://jobs.smartrecruiters.com/OUTsurance`),
which exposed **12 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-outsurance` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.OUTSURANCE`** in the source
> registry, so that a single `siteType: [Site.OUTSURANCE]` request returns
> OUTsurance's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.OUTSURANCE = 'outsurance'` to the `Site` enum. | must |
| FR-2 | `OUTsuranceService` implements `IScraper`, `@SourcePlugin({ site: Site.OUTSURANCE, name: 'OUTsurance', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'OUTsurance' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.OUTSURANCE`, `companyName = 'OUTsurance'`, `id` prefix `sr-`→`outsurance-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Short-term insurance
- Life insurance
- Direct and broker distribution
- South Africa-based
