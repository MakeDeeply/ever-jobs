# Spec: 1487 — Source Company Plugin: Longbridge Financial

| Field | Value |
| --- | --- |
| Spec ID | 1487 |
| Slug | source-company-longbridgefinancial |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-longbridgefinancial` for **Longbridge Financial** (US lender specializing in reverse mortgages and home equity products for seniors.). Sector:
Financial services / mortgage lending. HQ: Mahwah, New Jersey, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `LongbridgeFinancial` (`https://jobs.smartrecruiters.com/LongbridgeFinancial`),
which exposed **7 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-longbridgefinancial` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LONGBRIDGE_FINANCIAL`** in the source
> registry, so that a single `siteType: [Site.LONGBRIDGE_FINANCIAL]` request returns
> Longbridge Financial's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LONGBRIDGE_FINANCIAL = 'longbridgefinancial'` to the `Site` enum. | must |
| FR-2 | `LongbridgeFinancialService` implements `IScraper`, `@SourcePlugin({ site: Site.LONGBRIDGE_FINANCIAL, name: 'Longbridge Financial', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'LongbridgeFinancial' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LONGBRIDGE_FINANCIAL`, `companyName = 'Longbridge Financial'`, `id` prefix `sr-`→`longbridgefinancial-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Reverse mortgages
- Home equity products for seniors
- Loan origination and servicing
- US-based lender
