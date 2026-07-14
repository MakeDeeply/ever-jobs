# Spec: 1607 — Source Company Plugin: Creative Clicks

| Field | Value |
| --- | --- |
| Spec ID | 1607 |
| Slug | source-company-creativeclicks |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-creativeclicks` for **Creative Clicks** (Performance-marketing and mobile advertising company operating across digital acquisition channels.). Sector:
Performance marketing / adtech (e-commerce adjacent). HQ: Amsterdam, Netherlands.

The company's live postings are served by **Recruitee** on subdomain
`creativeclicks` (`https://creativeclicks.recruitee.com`), which exposed
**23 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-creativeclicks` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CREATIVE_CLICKS`** in the source
> registry, so that a single `siteType: [Site.CREATIVE_CLICKS]` request returns
> Creative Clicks's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CREATIVE_CLICKS = 'creativeclicks'` to the `Site` enum. | must |
| FR-2 | `CreativeClicksService` implements `IScraper`, `@SourcePlugin({ site: Site.CREATIVE_CLICKS, name: 'Creative Clicks', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'creativeclicks' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CREATIVE_CLICKS`, `companyName = 'Creative Clicks'`, `id` prefix `recruitee-`→`creativeclicks-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board with 8 live offers.
- Amsterdam HQ with an international footprint (a Toronto role was posted).
- Note: adtech/performance-marketing rather than a retailer itself.
