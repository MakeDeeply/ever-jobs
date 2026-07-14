# Spec: 1666 — Source Company Plugin: Trusted Shops

| Field | Value |
| --- | --- |
| Spec ID | 1666 |
| Slug | source-company-trustedshops |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-trustedshops` for **Trusted Shops** (E-commerce trust platform offering trustmarks, buyer protection, and reviews.). Sector:
E-commerce SaaS. HQ: Cologne, Germany.

The company's live postings are served by **Recruitee** on subdomain
`trustedshops` (`https://trustedshops.recruitee.com`), which exposed
**20 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-trustedshops` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TRUSTED_SHOPS`** in the source
> registry, so that a single `siteType: [Site.TRUSTED_SHOPS]` request returns
> Trusted Shops's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TRUSTED_SHOPS = 'trustedshops'` to the `Site` enum. | must |
| FR-2 | `TrustedShopsService` implements `IScraper`, `@SourcePlugin({ site: Site.TRUSTED_SHOPS, name: 'Trusted Shops', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'trustedshops' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TRUSTED_SHOPS`, `companyName = 'Trusted Shops'`, `id` prefix `recruitee-`→`trustedshops-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board at trustedshops.recruitee.com with 5 open offers
- Products include Trustmark, buyer protection, and reviews
- Offices in Cologne and Berlin, plus Amsterdam and Warsaw
