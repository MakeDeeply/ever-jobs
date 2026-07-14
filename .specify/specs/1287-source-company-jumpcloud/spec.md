# Spec: 1287 — Source Company Plugin: JumpCloud

| Field | Value |
| --- | --- |
| Spec ID | 1287 |
| Slug | source-company-jumpcloud |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-jumpcloud` for
**JumpCloud** (Cloud directory platform unifying identity, access management, and device security across operating systems.). Sector: Cybersecurity (Identity & Access Management). HQ: Louisville, Colorado, United States.

The company's live postings are served by **Lever** on job board
`jumpcloud` (`https://jobs.lever.co/jumpcloud`), which exposed
**22 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-jumpcloud` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.JUMPCLOUD`** in the source
> registry, so that a single `siteType: [Site.JUMPCLOUD]` request returns
> JumpCloud's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.JUMPCLOUD = 'jumpcloud'` to the `Site` enum. | must |
| FR-2 | `JumpCloudService` implements `IScraper`, `@SourcePlugin({ site: Site.JUMPCLOUD, name: 'JumpCloud', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'jumpcloud' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.JUMPCLOUD`, `companyName = 'JumpCloud'`, `id` prefix `lever-`→`jumpcloud-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Cloud directory platform for identity and access management
- Cross-platform device management (Windows, macOS, Linux)
- Includes SSO, MFA, and identity security posture management (ISPM)
- Global engineering teams including India
