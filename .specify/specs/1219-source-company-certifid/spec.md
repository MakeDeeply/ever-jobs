# Spec: 1219 — Source Company Plugin: CertifID

| Field | Value |
| --- | --- |
| Spec ID | 1219 |
| Slug | source-company-certifid |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-certifid` for
**CertifID** (Wire fraud prevention and identity verification platform for real estate and title transactions.). Sector: Cybersecurity / Fraud Prevention (Identity Verification). HQ: Austin, Texas, United States.

The company's live postings are served by **Lever** on job board
`certifid` (`https://jobs.lever.co/certifid`), which exposed
**7 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-certifid` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CERTIFID`** in the source
> registry, so that a single `siteType: [Site.CERTIFID]` request returns
> CertifID's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CERTIFID = 'certifid'` to the `Site` enum. | must |
| FR-2 | `CertifIDService` implements `IScraper`, `@SourcePlugin({ site: Site.CERTIFID, name: 'CertifID', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'certifid' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CERTIFID`, `companyName = 'CertifID'`, `id` prefix `lever-`→`certifid-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Identity verification and wire transfer authentication
- Serves title companies, law firms, lenders, and consumers
- Focused on real estate closing and escrow fraud prevention
- Reported protecting over a million real estate transactions annually
