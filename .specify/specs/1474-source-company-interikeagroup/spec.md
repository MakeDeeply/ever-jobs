# Spec: 1474 — Source Company Plugin: Inter IKEA Group

| Field | Value |
| --- | --- |
| Spec ID | 1474 |
| Slug | source-company-interikeagroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-interikeagroup` for **Inter IKEA Group** (The IKEA franchisor responsible for range development, supply and the IKEA brand.). Sector:
Home furnishing (franchisor, range & supply). HQ: Delft, Netherlands / Leiden.

The company's live postings are served by **SmartRecruiters** on company
identifier `InterIKEAGroup` (`https://jobs.smartrecruiters.com/InterIKEAGroup`),
which exposed **71 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-interikeagroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.INTER_IKEA_GROUP`** in the source
> registry, so that a single `siteType: [Site.INTER_IKEA_GROUP]` request returns
> Inter IKEA Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.INTER_IKEA_GROUP = 'interikeagroup'` to the `Site` enum. | must |
| FR-2 | `InterIKEAGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.INTER_IKEA_GROUP, name: 'Inter IKEA Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'InterIKEAGroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.INTER_IKEA_GROUP`, `companyName = 'Inter IKEA Group'`, `id` prefix `sr-`→`interikeagroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Owns the IKEA franchise and brand system
- Range development, supply chain and production
- Bases across the Netherlands and Sweden
- Part of the wider IKEA ecosystem
