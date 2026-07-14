# Spec: 1586 — Source Company Plugin: William Osler Health System

| Field | Value |
| --- | --- |
| Spec ID | 1586 |
| Slug | source-company-williamoslerhealthsystem |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-williamoslerhealthsystem` for **William Osler Health System** (Community hospital system serving the western Greater Toronto Area in Ontario.). Sector:
Healthcare / Hospital System. HQ: Brampton, Ontario, Canada.

The company's live postings are served by **SmartRecruiters** on company
identifier `williamoslerhealthsystem1` (`https://jobs.smartrecruiters.com/williamoslerhealthsystem1`),
which exposed **77 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-williamoslerhealthsystem` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.WILLIAM_OSLER_HEALTH_SYSTEM`** in the source
> registry, so that a single `siteType: [Site.WILLIAM_OSLER_HEALTH_SYSTEM]` request returns
> William Osler Health System's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.WILLIAM_OSLER_HEALTH_SYSTEM = 'williamoslerhealthsystem'` to the `Site` enum. | must |
| FR-2 | `WilliamOslerHealthSystemService` implements `IScraper`, `@SourcePlugin({ site: Site.WILLIAM_OSLER_HEALTH_SYSTEM, name: 'William Osler Health System', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'williamoslerhealthsystem1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.WILLIAM_OSLER_HEALTH_SYSTEM`, `companyName = 'William Osler Health System'`, `id` prefix `sr-`→`williamoslerhealthsystem-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Community hospital system in Ontario
- Serves the western Greater Toronto Area
- Acute, emergency, and specialty care
- Multiple hospital and health service sites
