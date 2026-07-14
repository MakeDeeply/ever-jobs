# Spec: 1597 — Source Company Plugin: benuta

| Field | Value |
| --- | --- |
| Spec ID | 1597 |
| Slug | source-company-benuta |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-benuta` for **benuta** (E-commerce retailer of rugs and home textiles selling across Europe via its own online shops.). Sector:
E-commerce (rugs & home textiles). HQ: Bonn, Germany.

The company's live postings are served by **Recruitee** on subdomain
`benutagmbh` (`https://benutagmbh.recruitee.com`), which exposed
**13 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-benuta` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.BENUTA`** in the source
> registry, so that a single `siteType: [Site.BENUTA]` request returns
> benuta's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.BENUTA = 'benuta'` to the `Site` enum. | must |
| FR-2 | `BenutaService` implements `IScraper`, `@SourcePlugin({ site: Site.BENUTA, name: 'benuta', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'benutagmbh' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.BENUTA`, `companyName = 'benuta'`, `id` prefix `recruitee-`→`benuta-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified board benutagmbh.recruitee.com/api/offers returned an offers array with 5 entries
- Headquartered in the Bonn/Cologne area of Germany
- Sells rugs and home textiles online across multiple European markets
- Roles span finance/accounting, influencer marketing and facility management
