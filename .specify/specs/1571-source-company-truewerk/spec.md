# Spec: 1571 — Source Company Plugin: Truewerk

| Field | Value |
| --- | --- |
| Spec ID | 1571 |
| Slug | source-company-truewerk |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-truewerk` for **Truewerk** (Technical workwear brand designing and selling performance work apparel direct to consumers.). Sector:
Workwear apparel (retail/e-commerce). HQ: Denver, Colorado, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `Truewerk` (`https://jobs.smartrecruiters.com/Truewerk`),
which exposed **3 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-truewerk` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TRUEWERK`** in the source
> registry, so that a single `siteType: [Site.TRUEWERK]` request returns
> Truewerk's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TRUEWERK = 'truewerk'` to the `Site` enum. | must |
| FR-2 | `TruewerkService` implements `IScraper`, `@SourcePlugin({ site: Site.TRUEWERK, name: 'Truewerk', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Truewerk' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TRUEWERK`, `companyName = 'Truewerk'`, `id` prefix `sr-`→`truewerk-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Technical workwear brand
- Headquartered in Denver, Colorado
- Sells via direct-to-consumer and wholesale
- Focus on performance apparel for tradespeople
