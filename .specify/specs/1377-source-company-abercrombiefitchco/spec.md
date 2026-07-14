# Spec: 1377 — Source Company Plugin: Abercrombie & Fitch Co.

| Field | Value |
| --- | --- |
| Spec ID | 1377 |
| Slug | source-company-abercrombiefitchco |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-abercrombiefitchco` for **Abercrombie & Fitch Co.** (Global specialty apparel retailer operating multiple clothing brands.). Sector:
Apparel retail (specialty). HQ: New Albany, Ohio, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `AbercrombieAndFitchCo` (`https://jobs.smartrecruiters.com/AbercrombieAndFitchCo`),
which exposed **11 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-abercrombiefitchco` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ABERCROMBIE_FITCH_CO`** in the source
> registry, so that a single `siteType: [Site.ABERCROMBIE_FITCH_CO]` request returns
> Abercrombie & Fitch Co.'s live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ABERCROMBIE_FITCH_CO = 'abercrombiefitchco'` to the `Site` enum. | must |
| FR-2 | `AbercrombieFitchCoService` implements `IScraper`, `@SourcePlugin({ site: Site.ABERCROMBIE_FITCH_CO, name: 'Abercrombie & Fitch Co.', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'AbercrombieAndFitchCo' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ABERCROMBIE_FITCH_CO`, `companyName = 'Abercrombie & Fitch Co.'`, `id` prefix `sr-`→`abercrombiefitchco-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Global specialty apparel retailer
- Brands include Abercrombie & Fitch and Hollister
- Publicly traded (NYSE: ANF)
- Physical stores plus e-commerce
