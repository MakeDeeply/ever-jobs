# Spec: 1310 — Source Company Plugin: Offchain Labs

| Field | Value |
| --- | --- |
| Spec ID | 1310 |
| Slug | source-company-offchainlabs |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-offchainlabs` for
**Offchain Labs** (Ethereum scaling company and developer of the Arbitrum Layer 2 rollup ecosystem.). Sector: Blockchain / Layer 2. HQ: New York, New York, United States.

The company's live postings are served by **Lever** on job board
`offchainlabs` (`https://jobs.lever.co/offchainlabs`), which exposed
**15 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-offchainlabs` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.OFFCHAIN_LABS`** in the source
> registry, so that a single `siteType: [Site.OFFCHAIN_LABS]` request returns
> Offchain Labs's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.OFFCHAIN_LABS = 'offchainlabs'` to the `Site` enum. | must |
| FR-2 | `OffchainLabsService` implements `IScraper`, `@SourcePlugin({ site: Site.OFFCHAIN_LABS, name: 'Offchain Labs', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'offchainlabs' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.OFFCHAIN_LABS`, `companyName = 'Offchain Labs'`, `id` prefix `lever-`→`offchainlabs-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Creator of the Arbitrum Layer 2 rollup for Ethereum.
- Focuses on blockchain scalability and security research.
- Lever postings include security engineering and recruiting roles.
