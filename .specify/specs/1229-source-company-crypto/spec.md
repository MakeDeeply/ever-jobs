# Spec: 1229 — Source Company Plugin: Crypto.com

| Field | Value |
| --- | --- |
| Spec ID | 1229 |
| Slug | source-company-crypto |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-crypto` for
**Crypto.com** (Cryptocurrency exchange and financial-services platform for retail and institutional users.). Sector: Crypto / Fintech. HQ: Singapore, Singapore.

The company's live postings are served by **Lever** on job board
`crypto` (`https://jobs.lever.co/crypto`), which exposed
**140 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-crypto` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CRYPTO_COM`** in the source
> registry, so that a single `siteType: [Site.CRYPTO_COM]` request returns
> Crypto.com's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CRYPTO_COM = 'crypto'` to the `Site` enum. | must |
| FR-2 | `CryptoComService` implements `IScraper`, `@SourcePlugin({ site: Site.CRYPTO_COM, name: 'Crypto.com', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'crypto' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CRYPTO_COM`, `companyName = 'Crypto.com'`, `id` prefix `lever-`→`crypto-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Founded in 2016, serving tens of millions of customers.
- Regulated presence referencing MAS in Singapore.
- Engineering and support hubs across Singapore, Hong Kong, and Europe.
