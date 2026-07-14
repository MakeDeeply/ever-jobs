# Spec: 1445 — Source Company Plugin: Entire Hire

| Field | Value |
| --- | --- |
| Spec ID | 1445 |
| Slug | source-company-entirehire |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-entirehire` for **Entire Hire** (Staffing and executive search firm placing professional and management talent.). Sector:
Staffing and executive search. HQ: Toronto, Ontario, Canada.

The company's live postings are served by **SmartRecruiters** on company
identifier `entirehire` (`https://jobs.smartrecruiters.com/entirehire`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-entirehire` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ENTIRE_HIRE`** in the source
> registry, so that a single `siteType: [Site.ENTIRE_HIRE]` request returns
> Entire Hire's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ENTIRE_HIRE = 'entirehire'` to the `Site` enum. | must |
| FR-2 | `EntireHireService` implements `IScraper`, `@SourcePlugin({ site: Site.ENTIRE_HIRE, name: 'Entire Hire', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'entirehire' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ENTIRE_HIRE`, `companyName = 'Entire Hire'`, `id` prefix `sr-`→`entirehire-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Staffing and executive search
- Professional and management roles
- Permanent placement
