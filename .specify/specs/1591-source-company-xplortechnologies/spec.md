# Spec: 1591 — Source Company Plugin: Xplor Technologies

| Field | Value |
| --- | --- |
| Spec ID | 1591 |
| Slug | source-company-xplortechnologies |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-xplortechnologies` for **Xplor Technologies** (Provider of vertical software and embedded payments for businesses.). Sector:
Vertical SaaS and embedded payments software. HQ: Atlanta, Georgia, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `Xplor` (`https://jobs.smartrecruiters.com/Xplor`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-xplortechnologies` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.XPLOR_TECHNOLOGIES`** in the source
> registry, so that a single `siteType: [Site.XPLOR_TECHNOLOGIES]` request returns
> Xplor Technologies's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.XPLOR_TECHNOLOGIES = 'xplortechnologies'` to the `Site` enum. | must |
| FR-2 | `XplorTechnologiesService` implements `IScraper`, `@SourcePlugin({ site: Site.XPLOR_TECHNOLOGIES, name: 'Xplor Technologies', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Xplor' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.XPLOR_TECHNOLOGIES`, `companyName = 'Xplor Technologies'`, `id` prefix `sr-`→`xplortechnologies-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Vertical SaaS for fitness, recreation, field services
- Embedded payment processing
- Business management software
- Global operations
