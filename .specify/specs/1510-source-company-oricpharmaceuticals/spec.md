# Spec: 1510 — Source Company Plugin: ORIC Pharmaceuticals

| Field | Value |
| --- | --- |
| Spec ID | 1510 |
| Slug | source-company-oricpharmaceuticals |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-oricpharmaceuticals` for **ORIC Pharmaceuticals** (Clinical-stage oncology company developing therapies to overcome cancer treatment resistance.). Sector:
Biotechnology / Pharmaceuticals. HQ: South San Francisco, California, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `ORICPharmaceuticals` (`https://jobs.smartrecruiters.com/ORICPharmaceuticals`),
which exposed **9 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-oricpharmaceuticals` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ORIC_PHARMACEUTICALS`** in the source
> registry, so that a single `siteType: [Site.ORIC_PHARMACEUTICALS]` request returns
> ORIC Pharmaceuticals's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ORIC_PHARMACEUTICALS = 'oricpharmaceuticals'` to the `Site` enum. | must |
| FR-2 | `ORICPharmaceuticalsService` implements `IScraper`, `@SourcePlugin({ site: Site.ORIC_PHARMACEUTICALS, name: 'ORIC Pharmaceuticals', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ORICPharmaceuticals' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ORIC_PHARMACEUTICALS`, `companyName = 'ORIC Pharmaceuticals'`, `id` prefix `sr-`→`oricpharmaceuticals-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Clinical-stage oncology company
- Focus on cancer treatment resistance
- Pipeline across multiple tumor types
- Headquartered in South San Francisco
