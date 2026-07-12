# Spec: 1108 — Source Company Plugin: Trust Wallet

| Field | Value |
| --- | --- |
| Spec ID | 1108 |
| Slug | source-company-trustwallet |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-trustwallet` for
**Trust Wallet** (Non-custodial cryptocurrency wallet supporting multiple blockchains and assets.). Sector: Crypto wallet. HQ: Singapore.

The company's live postings are served by **Ashby** on job board
`trust-wallet` (`https://jobs.ashbyhq.com/trust-wallet`), which exposed
**14 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-trustwallet` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.TRUST_WALLET`** in the source
> registry, so that a single `siteType: [Site.TRUST_WALLET]` request returns
> Trust Wallet's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.TRUST_WALLET = 'trustwallet'` to the `Site` enum. | must |
| FR-2 | `TrustWalletService` implements `IScraper`, `@SourcePlugin({ site: Site.TRUST_WALLET, name: 'Trust Wallet', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'trust-wallet' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.TRUST_WALLET`, `companyName = 'Trust Wallet'`, `id` prefix `ashby-`→`trustwallet-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Non-custodial multi-chain crypto wallet
- Supports a wide range of digital assets
- Focused on self-custody for users
