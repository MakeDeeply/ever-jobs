# Spec: 1567 — Source Company Plugin: Texas Health Resources

| Field | Value |
| --- | --- |
| Spec ID | 1567 |
| Slug | source-company-texashealthresources |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-texashealthresources` for **Texas Health Resources** (Faith-based, non-profit health system serving north Texas.). Sector:
Healthcare / Hospital System. HQ: Arlington, Texas, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `TexasHealthResources` (`https://jobs.smartrecruiters.com/TexasHealthResources`),
which exposed **9 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-texashealthresources` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TEXAS_HEALTH_RESOURCES`** in the source
> registry, so that a single `siteType: [Site.TEXAS_HEALTH_RESOURCES]` request returns
> Texas Health Resources's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TEXAS_HEALTH_RESOURCES = 'texashealthresources'` to the `Site` enum. | must |
| FR-2 | `TexasHealthResourcesService` implements `IScraper`, `@SourcePlugin({ site: Site.TEXAS_HEALTH_RESOURCES, name: 'Texas Health Resources', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'TexasHealthResources' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TEXAS_HEALTH_RESOURCES`, `companyName = 'Texas Health Resources'`, `id` prefix `sr-`→`texashealthresources-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Non-profit faith-based health system
- Serves the Dallas-Fort Worth region
- Hospitals and outpatient facilities
- Acute and specialty care
