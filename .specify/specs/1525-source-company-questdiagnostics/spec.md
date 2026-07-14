# Spec: 1525 — Source Company Plugin: Quest Diagnostics

| Field | Value |
| --- | --- |
| Spec ID | 1525 |
| Slug | source-company-questdiagnostics |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-questdiagnostics` for **Quest Diagnostics** (Provider of clinical laboratory testing, diagnostic information services, and related products.). Sector:
Diagnostics / Clinical Laboratory. HQ: Secaucus, New Jersey, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `QuestDiagnostics7` (`https://jobs.smartrecruiters.com/QuestDiagnostics7`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-questdiagnostics` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.QUEST_DIAGNOSTICS`** in the source
> registry, so that a single `siteType: [Site.QUEST_DIAGNOSTICS]` request returns
> Quest Diagnostics's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.QUEST_DIAGNOSTICS = 'questdiagnostics'` to the `Site` enum. | must |
| FR-2 | `QuestDiagnosticsService` implements `IScraper`, `@SourcePlugin({ site: Site.QUEST_DIAGNOSTICS, name: 'Quest Diagnostics', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'QuestDiagnostics7' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.QUEST_DIAGNOSTICS`, `companyName = 'Quest Diagnostics'`, `id` prefix `sr-`→`questdiagnostics-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Clinical laboratory and diagnostic testing
- National network of patient service centers
- Serves physicians, hospitals, and health plans
- Publicly traded on NYSE
