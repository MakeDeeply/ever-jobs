# Spec: 1645 — Source Company Plugin: Online Payment Platform (OPP)

| Field | Value |
| --- | --- |
| Spec ID | 1645 |
| Slug | source-company-onlinepaymentplatformopp |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-onlinepaymentplatformopp` for **Online Payment Platform (OPP)** (Delft-based payment service provider specializing in marketplace and platform payments with escrow-style flows.). Sector:
Payments / PSP for marketplaces. HQ: Delft, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`onlinepaymentplatform` (`https://onlinepaymentplatform.recruitee.com`), which exposed
**8 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-onlinepaymentplatformopp` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ONLINE_PAYMENT_PLATFORM_OPP`** in the source
> registry, so that a single `siteType: [Site.ONLINE_PAYMENT_PLATFORM_OPP]` request returns
> Online Payment Platform (OPP)'s live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ONLINE_PAYMENT_PLATFORM_OPP = 'onlinepaymentplatformopp'` to the `Site` enum. | must |
| FR-2 | `OnlinePaymentPlatformOPPService` implements `IScraper`, `@SourcePlugin({ site: Site.ONLINE_PAYMENT_PLATFORM_OPP, name: 'Online Payment Platform (OPP)', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'onlinepaymentplatform' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ONLINE_PAYMENT_PLATFORM_OPP`, `companyName = 'Online Payment Platform (OPP)'`, `id` prefix `recruitee-`→`onlinepaymentplatformopp-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Marketplace/platform payments provider (split payments and escrow flows)
- Recruitee board returned six live openings across finance, compliance and engineering
- Verified slug is onlinepaymentplatform (not opp)
