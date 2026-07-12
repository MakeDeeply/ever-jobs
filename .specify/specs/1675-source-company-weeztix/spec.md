# Spec: 1675 — Source Company Plugin: Weeztix

| Field | Value |
| --- | --- |
| Spec ID | 1675 |
| Slug | source-company-weeztix |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-weeztix` for **Weeztix** (Event-ticketing SaaS platform selling and managing tickets for events and festivals.). Sector:
Ticketing / events SaaS (retail-tech). HQ: Eindhoven / Amsterdam, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`weeztix` (`https://weeztix.recruitee.com`), which exposed
**6 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-weeztix` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.WEEZTIX`** in the source
> registry, so that a single `siteType: [Site.WEEZTIX]` request returns
> Weeztix's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.WEEZTIX = 'weeztix'` to the `Site` enum. | must |
| FR-2 | `WeeztixService` implements `IScraper`, `@SourcePlugin({ site: Site.WEEZTIX, name: 'Weeztix', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'weeztix' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.WEEZTIX`, `companyName = 'Weeztix'`, `id` prefix `recruitee-`→`weeztix-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board with 7 live offers.
- Roles split across Eindhoven and Amsterdam offices.
- Ranked on Deloitte Technology Fast 50 and FD Gazellen lists per its own careers copy.
