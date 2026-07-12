# Spec: 1595 — Source Company Plugin: Alphacomm

| Field | Value |
| --- | --- |
| Spec ID | 1595 |
| Slug | source-company-alphacomm |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-alphacomm` for **Alphacomm** (Digital goods and payments infrastructure provider for telcos, airlines, OTAs, and retailers.). Sector:
Payments / digital-goods SaaS. HQ: Rotterdam, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`alphacomm` (`https://alphacomm.recruitee.com`), which exposed
**3 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-alphacomm` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ALPHACOMM`** in the source
> registry, so that a single `siteType: [Site.ALPHACOMM]` request returns
> Alphacomm's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ALPHACOMM = 'alphacomm'` to the `Site` enum. | must |
| FR-2 | `AlphacommService` implements `IScraper`, `@SourcePlugin({ site: Site.ALPHACOMM, name: 'Alphacomm', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'alphacomm' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ALPHACOMM`, `companyName = 'Alphacomm'`, `id` prefix `recruitee-`→`alphacomm-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Rotterdam-based payments / digital-goods infrastructure
- B2B brands Checkmaxx and Collectmaxx
- Recruitee board alphacomm.recruitee.com verified
