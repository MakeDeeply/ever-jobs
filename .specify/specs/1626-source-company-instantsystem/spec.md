# Spec: 1626 — Source Company Plugin: Instant System

| Field | Value |
| --- | --- |
| Spec ID | 1626 |
| Slug | source-company-instantsystem |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-instantsystem` for **Instant System** (Mobility-as-a-Service SaaS provider building white-label multimodal urban-mobility apps for transit authorities.). Sector:
MobilityTech / SaaS. HQ: Sophia-Antipolis, France.

The company's live postings are served by **Recruitee** on subdomain
`instantsystem` (`https://instantsystem.recruitee.com`), which exposed
**3 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-instantsystem` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.INSTANT_SYSTEM`** in the source
> registry, so that a single `siteType: [Site.INSTANT_SYSTEM]` request returns
> Instant System's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.INSTANT_SYSTEM = 'instantsystem'` to the `Site` enum. | must |
| FR-2 | `InstantSystemService` implements `IScraper`, `@SourcePlugin({ site: Site.INSTANT_SYSTEM, name: 'Instant System', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'instantsystem' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.INSTANT_SYSTEM`, `companyName = 'Instant System'`, `id` prefix `recruitee-`→`instantsystem-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board: https://instantsystem.recruitee.com/api/offers returns 3 open offers
- Headquartered and R&D-based in Sophia-Antipolis / Biot
- White-label MaaS apps used by public transit authorities
