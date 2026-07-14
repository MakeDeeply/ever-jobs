# Spec: 1131 — Source Company Plugin: Healthtech-1

| Field | Value |
| --- | --- |
| Spec ID | 1131 |
| Slug | source-company-healthtech1 |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-healthtech1` for
**Healthtech-1** (Automates repetitive administrative processes for healthcare providers.). Sector: Healthtech (primary care automation). HQ: London, England, UK.

The company's live postings are served by **Ashby** on job board
`healthtech-1` (`https://jobs.ashbyhq.com/healthtech-1`), which exposed
**10 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-healthtech1` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.HEALTHTECH_1`** in the source
> registry, so that a single `siteType: [Site.HEALTHTECH_1]` request returns
> Healthtech-1's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.HEALTHTECH_1 = 'healthtech1'` to the `Site` enum. | must |
| FR-2 | `Healthtech1Service` implements `IScraper`, `@SourcePlugin({ site: Site.HEALTHTECH_1, name: 'Healthtech-1', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'healthtech-1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.HEALTHTECH_1`, `companyName = 'Healthtech-1'`, `id` prefix `ashby-`→`healthtech1-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Automates healthcare administrative workflows
- Works with UK GP practices
- Based in London
