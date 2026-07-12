# Spec: 1553 — Source Company Plugin: Standard Bank Group

| Field | Value |
| --- | --- |
| Spec ID | 1553 |
| Slug | source-company-standardbankgroup |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-standardbankgroup` for **Standard Bank Group** (Africa's largest bank by assets, offering retail, business, and corporate banking.). Sector:
Banking / financial services. HQ: Johannesburg, Gauteng, South Africa.

The company's live postings are served by **SmartRecruiters** on company
identifier `StandardBankGroup` (`https://jobs.smartrecruiters.com/StandardBankGroup`),
which exposed **97 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-standardbankgroup` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.STANDARD_BANK_GROUP`** in the source
> registry, so that a single `siteType: [Site.STANDARD_BANK_GROUP]` request returns
> Standard Bank Group's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.STANDARD_BANK_GROUP = 'standardbankgroup'` to the `Site` enum. | must |
| FR-2 | `StandardBankGroupService` implements `IScraper`, `@SourcePlugin({ site: Site.STANDARD_BANK_GROUP, name: 'Standard Bank Group', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'StandardBankGroup' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.STANDARD_BANK_GROUP`, `companyName = 'Standard Bank Group'`, `id` prefix `sr-`→`standardbankgroup-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Retail and business banking
- Corporate and investment banking
- Operations across Africa
- Largest African bank by assets
