# Spec: 1502 — Source Company Plugin: NielsenIQ

| Field | Value |
| --- | --- |
| Spec ID | 1502 |
| Slug | source-company-nielseniq |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-nielseniq` for **NielsenIQ** (Consumer intelligence company providing retail measurement and analytics.). Sector:
Consumer intelligence data & analytics technology. HQ: Chicago, Illinois, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `NielsenIQ` (`https://jobs.smartrecruiters.com/NielsenIQ`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-nielseniq` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.NIELSENIQ`** in the source
> registry, so that a single `siteType: [Site.NIELSENIQ]` request returns
> NielsenIQ's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.NIELSENIQ = 'nielseniq'` to the `Site` enum. | must |
| FR-2 | `NielsenIQService` implements `IScraper`, `@SourcePlugin({ site: Site.NIELSENIQ, name: 'NielsenIQ', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'NielsenIQ' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.NIELSENIQ`, `companyName = 'NielsenIQ'`, `id` prefix `sr-`→`nielseniq-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Retail measurement and consumer panel data
- Analytics and data platforms
- Global data engineering operations
- Serves retailers and CPG manufacturers
