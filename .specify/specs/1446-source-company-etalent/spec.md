# Spec: 1446 — Source Company Plugin: eTalent

| Field | Value |
| --- | --- |
| Spec ID | 1446 |
| Slug | source-company-etalent |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-etalent` for **eTalent** (Staffing firm providing recruitment and placement services.). Sector:
Staffing and recruiting. HQ: United States.

The company's live postings are served by **SmartRecruiters** on company
identifier `ETalent` (`https://jobs.smartrecruiters.com/ETalent`),
which exposed **10 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-etalent` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ETALENT`** in the source
> registry, so that a single `siteType: [Site.ETALENT]` request returns
> eTalent's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ETALENT = 'etalent'` to the `Site` enum. | must |
| FR-2 | `ETalentService` implements `IScraper`, `@SourcePlugin({ site: Site.ETALENT, name: 'eTalent', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ETalent' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ETALENT`, `companyName = 'eTalent'`, `id` prefix `sr-`→`etalent-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Staffing and recruiting
- Candidate placement services
- IT and specialist roles
