# Spec: 1333 — Source Company Plugin: Safe Security

| Field | Value |
| --- | --- |
| Spec ID | 1333 |
| Slug | source-company-safe |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-safe` for
**Safe Security** (Cyber risk quantification and management company that models and predicts breach likelihood for enterprises.). Sector: Cybersecurity (Cyber Risk Quantification). HQ: Palo Alto, California, United States.

The company's live postings are served by **Lever** on job board
`safe` (`https://jobs.lever.co/safe`), which exposed
**14 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-safe` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.SAFE_SECURITY`** in the source
> registry, so that a single `siteType: [Site.SAFE_SECURITY]` request returns
> Safe Security's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.SAFE_SECURITY = 'safe'` to the `Site` enum. | must |
| FR-2 | `SafeSecurityService` implements `IScraper`, `@SourcePlugin({ site: Site.SAFE_SECURITY, name: 'Safe Security', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'safe' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.SAFE_SECURITY`, `companyName = 'Safe Security'`, `id` prefix `lever-`→`safe-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Focus on cyber risk quantification and breach-likelihood modeling
- Series C funded (reported $170M raise)
- AI/ML-driven risk decisioning teams
- Engineering presence in Bengaluru and New Delhi
