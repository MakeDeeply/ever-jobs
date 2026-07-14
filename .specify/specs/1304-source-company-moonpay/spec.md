# Spec: 1304 — Source Company Plugin: MoonPay

| Field | Value |
| --- | --- |
| Spec ID | 1304 |
| Slug | source-company-moonpay |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-moonpay` for
**MoonPay** (Payments platform for buying, selling, and paying in digital currencies.). Sector: Crypto Payments. HQ: New York, New York, United States.

The company's live postings are served by **Lever** on job board
`moonpay` (`https://jobs.lever.co/moonpay`), which exposed
**9 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-moonpay` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.MOONPAY`** in the source
> registry, so that a single `siteType: [Site.MOONPAY]` request returns
> MoonPay's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.MOONPAY = 'moonpay'` to the `Site` enum. | must |
| FR-2 | `MoonPayService` implements `IScraper`, `@SourcePlugin({ site: Site.MOONPAY, name: 'MoonPay', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'moonpay' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.MOONPAY`, `companyName = 'MoonPay'`, `id` prefix `lever-`→`moonpay-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Licensed in the US and regulated in the UK, EU, Canada, and Australia.
- Operates a multi-entity global footprint with distributed offices.
- Roles include risk, audit, and communications leadership.
