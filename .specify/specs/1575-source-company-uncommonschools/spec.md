# Spec: 1575 — Source Company Plugin: Uncommon Schools

| Field | Value |
| --- | --- |
| Spec ID | 1575 |
| Slug | source-company-uncommonschools |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-uncommonschools` for **Uncommon Schools** (Non-profit network of public charter schools across New York, New Jersey, and Massachusetts.). Sector:
Education (K-12 public charter schools / non-profit). HQ: New York, New York, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `UncommonSchools` (`https://jobs.smartrecruiters.com/UncommonSchools`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-uncommonschools` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.UNCOMMON_SCHOOLS`** in the source
> registry, so that a single `siteType: [Site.UNCOMMON_SCHOOLS]` request returns
> Uncommon Schools's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.UNCOMMON_SCHOOLS = 'uncommonschools'` to the `Site` enum. | must |
| FR-2 | `UncommonSchoolsService` implements `IScraper`, `@SourcePlugin({ site: Site.UNCOMMON_SCHOOLS, name: 'Uncommon Schools', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'UncommonSchools' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.UNCOMMON_SCHOOLS`, `companyName = 'Uncommon Schools'`, `id` prefix `sr-`→`uncommonschools-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Public charter school network
- Campuses in NY, NJ, and MA
- K-12 college-preparatory focus
- Non-profit organization
