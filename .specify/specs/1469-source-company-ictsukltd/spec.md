# Spec: 1469 — Source Company Plugin: ICTS (UK) Ltd

| Field | Value |
| --- | --- |
| Spec ID | 1469 |
| Slug | source-company-ictsukltd |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-ictsukltd` for **ICTS (UK) Ltd** (UK provider of security and aviation-related services.). Sector:
Security & aviation services. HQ: United Kingdom.

The company's live postings are served by **SmartRecruiters** on company
identifier `ICTSUKLtd` (`https://jobs.smartrecruiters.com/ICTSUKLtd`),
which exposed **25 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-ictsukltd` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ICTS_UK_LTD`** in the source
> registry, so that a single `siteType: [Site.ICTS_UK_LTD]` request returns
> ICTS (UK) Ltd's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ICTS_UK_LTD = 'ictsukltd'` to the `Site` enum. | must |
| FR-2 | `ICTSUKLtdService` implements `IScraper`, `@SourcePlugin({ site: Site.ICTS_UK_LTD, name: 'ICTS (UK) Ltd', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ICTSUKLtd' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ICTS_UK_LTD`, `companyName = 'ICTS (UK) Ltd'`, `id` prefix `sr-`→`ictsukltd-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Based in the United Kingdom
- Aviation and commercial security services
- Screening and guarding operations
- Part of the international ICTS group
