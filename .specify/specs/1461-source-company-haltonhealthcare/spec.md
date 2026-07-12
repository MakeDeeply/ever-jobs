# Spec: 1461 — Source Company Plugin: Halton Healthcare

| Field | Value |
| --- | --- |
| Spec ID | 1461 |
| Slug | source-company-haltonhealthcare |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-haltonhealthcare` for **Halton Healthcare** (Community hospital system serving the Halton region of Ontario, Canada.). Sector:
Healthcare / Hospital System. HQ: Oakville, Ontario, Canada.

The company's live postings are served by **SmartRecruiters** on company
identifier `HaltonHealthcare1` (`https://jobs.smartrecruiters.com/HaltonHealthcare1`),
which exposed **39 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-haltonhealthcare` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HALTON_HEALTHCARE`** in the source
> registry, so that a single `siteType: [Site.HALTON_HEALTHCARE]` request returns
> Halton Healthcare's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HALTON_HEALTHCARE = 'haltonhealthcare'` to the `Site` enum. | must |
| FR-2 | `HaltonHealthcareService` implements `IScraper`, `@SourcePlugin({ site: Site.HALTON_HEALTHCARE, name: 'Halton Healthcare', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'HaltonHealthcare1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HALTON_HEALTHCARE`, `companyName = 'Halton Healthcare'`, `id` prefix `sr-`→`haltonhealthcare-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Community hospitals in Oakville, Milton, Georgetown
- Serves the Halton region of Ontario
- Acute, emergency, and maternal-child care
- Public hospital organization
