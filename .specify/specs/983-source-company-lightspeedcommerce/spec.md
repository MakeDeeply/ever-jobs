# Spec: 983 — Source Company Plugin: Lightspeed Commerce

| Field | Value |
| --- | --- |
| Spec ID | 983 |
| Slug | source-company-lightspeedcommerce |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-lightspeedcommerce` for
**Lightspeed Commerce** (Cloud-based point-of-sale and commerce platform for retail, restaurant, and hospitality businesses.). Sector: Retail tech / commerce platform. HQ: Montreal, Quebec, Canada.

The company's live postings are served by **Ashby** on job board
`lightspeedhq` (`https://jobs.ashbyhq.com/lightspeedhq`), which exposed
**208 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-lightspeedcommerce` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.LIGHTSPEED_COMMERCE`** in the source
> registry, so that a single `siteType: [Site.LIGHTSPEED_COMMERCE]` request returns
> Lightspeed Commerce's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.LIGHTSPEED_COMMERCE = 'lightspeedcommerce'` to the `Site` enum. | must |
| FR-2 | `LightspeedCommerceService` implements `IScraper`, `@SourcePlugin({ site: Site.LIGHTSPEED_COMMERCE, name: 'Lightspeed Commerce', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'lightspeedhq' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.LIGHTSPEED_COMMERCE`, `companyName = 'Lightspeed Commerce'`, `id` prefix `ashby-`→`lightspeedcommerce-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Cloud point-of-sale and payments platform for retail and hospitality
- Publicly listed (NYSE and TSX)
- Operates across North America, Europe, and other regions
