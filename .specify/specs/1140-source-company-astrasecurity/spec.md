# Spec: 1140 — Source Company Plugin: Astra Security

| Field | Value |
| --- | --- |
| Spec ID | 1140 |
| Slug | source-company-astrasecurity |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-astrasecurity` for
**Astra Security** (Penetration testing and vulnerability management platform.). Sector: Offensive Security / Pentesting. HQ: Delaware, United States.

The company's live postings are served by **Ashby** on job board
`astra` (`https://jobs.ashbyhq.com/astra`), which exposed
**8 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-astrasecurity` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ASTRA_SECURITY`** in the source
> registry, so that a single `siteType: [Site.ASTRA_SECURITY]` request returns
> Astra Security's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ASTRA_SECURITY = 'astrasecurity'` to the `Site` enum. | must |
| FR-2 | `AstraSecurityService` implements `IScraper`, `@SourcePlugin({ site: Site.ASTRA_SECURITY, name: 'Astra Security', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'astra' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ASTRA_SECURITY`, `companyName = 'Astra Security'`, `id` prefix `ashby-`→`astrasecurity-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Combined automated scanning and manual pentesting
- Vulnerability management and remediation workflows
- Pentest platform for web and application security
