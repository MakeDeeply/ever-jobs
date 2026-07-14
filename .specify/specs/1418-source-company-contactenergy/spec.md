# Spec: 1418 — Source Company Plugin: Contact Energy

| Field | Value |
| --- | --- |
| Spec ID | 1418 |
| Slug | source-company-contactenergy |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-contactenergy` for **Contact Energy** (One of New Zealand's largest electricity generators and retailers, with a large geothermal and hydro portfolio.). Sector:
Energy Utility. HQ: Wellington, Wellington, New Zealand.

The company's live postings are served by **SmartRecruiters** on company
identifier `ContactEnergy` (`https://jobs.smartrecruiters.com/ContactEnergy`),
which exposed **17 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-contactenergy` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.CONTACT_ENERGY`** in the source
> registry, so that a single `siteType: [Site.CONTACT_ENERGY]` request returns
> Contact Energy's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.CONTACT_ENERGY = 'contactenergy'` to the `Site` enum. | must |
| FR-2 | `ContactEnergyService` implements `IScraper`, `@SourcePlugin({ site: Site.CONTACT_ENERGY, name: 'Contact Energy', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'ContactEnergy' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.CONTACT_ENERGY`, `companyName = 'Contact Energy'`, `id` prefix `sr-`→`contactenergy-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Electricity generation and retail
- Geothermal and hydro generation
- One of New Zealand's largest listed companies
- Headquartered in Wellington, New Zealand
