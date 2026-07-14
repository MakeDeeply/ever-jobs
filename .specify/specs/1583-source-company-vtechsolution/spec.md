# Spec: 1583 — Source Company Plugin: vTech Solution

| Field | Value |
| --- | --- |
| Spec ID | 1583 |
| Slug | source-company-vtechsolution |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-vtechsolution` for **vTech Solution** (IT staffing and managed services provider serving government and commercial clients.). Sector:
IT staffing and services. HQ: Washington, D.C., United States.

The company's live postings are served by **SmartRecruiters** on company
identifier `VTechSolution1` (`https://jobs.smartrecruiters.com/VTechSolution1`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-vtechsolution` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.VTECH_SOLUTION`** in the source
> registry, so that a single `siteType: [Site.VTECH_SOLUTION]` request returns
> vTech Solution's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.VTECH_SOLUTION = 'vtechsolution'` to the `Site` enum. | must |
| FR-2 | `VTechSolutionService` implements `IScraper`, `@SourcePlugin({ site: Site.VTECH_SOLUTION, name: 'vTech Solution', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'VTechSolution1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.VTECH_SOLUTION`, `companyName = 'vTech Solution'`, `id` prefix `sr-`→`vtechsolution-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- IT staffing and managed services
- Government and commercial clients
- Nationwide placement
