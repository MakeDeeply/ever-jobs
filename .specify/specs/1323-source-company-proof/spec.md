# Spec: 1323 — Source Company Plugin: Proof

| Field | Value |
| --- | --- |
| Spec ID | 1323 |
| Slug | source-company-proof |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-proof` for
**Proof** (Identity-assured transaction management platform for verifying identity and preventing fraud in high-value transactions.). Sector: Cybersecurity / Fraud Prevention (Identity Verification). HQ: Austin, Texas, United States.

The company's live postings are served by **Lever** on job board
`proof` (`https://jobs.lever.co/proof`), which exposed
**3 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-proof` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.PROOF`** in the source
> registry, so that a single `siteType: [Site.PROOF]` request returns
> Proof's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.PROOF = 'proof'` to the `Site` enum. | must |
| FR-2 | `ProofService` implements `IScraper`, `@SourcePlugin({ site: Site.PROOF, name: 'Proof', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'proof' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.PROOF`, `companyName = 'Proof'`, `id` prefix `lever-`→`proof-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Identity verification and fraud prevention for online transactions
- Secures real estate, mortgage, and auto-sale workflows
- Positions itself around digital trust and identity assurance
- Fully remote engineering, legal, and solutions teams
