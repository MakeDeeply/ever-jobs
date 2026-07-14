# Spec: 1481 — Source Company Plugin: Kittitas Valley Healthcare

| Field | Value |
| --- | --- |
| Spec ID | 1481 |
| Slug | source-company-kittitasvalleyhealthcare |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-kittitasvalleyhealthcare` for **Kittitas Valley Healthcare** (Community hospital and clinic network serving Kittitas County, Washington.). Sector:
Healthcare / Hospital System. HQ: Ellensburg, Washington, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `KittitasValleyHealthcare` (`https://jobs.smartrecruiters.com/KittitasValleyHealthcare`),
which exposed **55 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-kittitasvalleyhealthcare` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.KITTITAS_VALLEY_HEALTHCARE`** in the source
> registry, so that a single `siteType: [Site.KITTITAS_VALLEY_HEALTHCARE]` request returns
> Kittitas Valley Healthcare's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.KITTITAS_VALLEY_HEALTHCARE = 'kittitasvalleyhealthcare'` to the `Site` enum. | must |
| FR-2 | `KittitasValleyHealthcareService` implements `IScraper`, `@SourcePlugin({ site: Site.KITTITAS_VALLEY_HEALTHCARE, name: 'Kittitas Valley Healthcare', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'KittitasValleyHealthcare' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.KITTITAS_VALLEY_HEALTHCARE`, `companyName = 'Kittitas Valley Healthcare'`, `id` prefix `sr-`→`kittitasvalleyhealthcare-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Community hospital and clinic network
- Public hospital district in Washington State
- Acute, emergency, and outpatient care
- Serves Kittitas County
