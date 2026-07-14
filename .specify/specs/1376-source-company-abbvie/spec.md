# Spec: 1376 — Source Company Plugin: AbbVie

| Field | Value |
| --- | --- |
| Spec ID | 1376 |
| Slug | source-company-abbvie |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-abbvie` for **AbbVie** (Global research-based biopharmaceutical company developing medicines in immunology, oncology, neuroscience, and eye care.). Sector:
Pharmaceuticals. HQ: North Chicago, Illinois, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `AbbVie` (`https://jobs.smartrecruiters.com/AbbVie`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-abbvie` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ABBVIE`** in the source
> registry, so that a single `siteType: [Site.ABBVIE]` request returns
> AbbVie's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ABBVIE = 'abbvie'` to the `Site` enum. | must |
| FR-2 | `AbbVieService` implements `IScraper`, `@SourcePlugin({ site: Site.ABBVIE, name: 'AbbVie', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'AbbVie' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ABBVIE`, `companyName = 'AbbVie'`, `id` prefix `sr-`→`abbvie-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Therapeutic focus: immunology, oncology, neuroscience
- Spun off from Abbott in 2013
- Products include Humira, Skyrizi, Rinvoq
- Global R&D and manufacturing operations
