# Spec: 1565 — Source Company Plugin: Telefónica Tech

| Field | Value |
| --- | --- |
| Spec ID | 1565 |
| Slug | source-company-telefnicatech |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-telefnicatech` for **Telefónica Tech** (Digital services and technology unit of the Telefónica telecommunications group.). Sector:
Telecommunications / Digital Services. HQ: Madrid, Spain.

The company's live postings are served by **SmartRecruiters** on company
identifier `telefonicatech` (`https://jobs.smartrecruiters.com/telefonicatech`),
which exposed **51 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-telefnicatech` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TELEF_NICA_TECH`** in the source
> registry, so that a single `siteType: [Site.TELEF_NICA_TECH]` request returns
> Telefónica Tech's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TELEF_NICA_TECH = 'telefnicatech'` to the `Site` enum. | must |
| FR-2 | `TelefNicaTechService` implements `IScraper`, `@SourcePlugin({ site: Site.TELEF_NICA_TECH, name: 'Telefónica Tech', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'telefonicatech' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TELEF_NICA_TECH`, `companyName = 'Telefónica Tech'`, `id` prefix `sr-`→`telefnicatech-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Part of the Telefónica group
- Focus on cloud, cybersecurity and IoT
- Serves business customers
- Roles in consulting and engineering
