# Spec: 1428 — Source Company Plugin: Delivery Hero

| Field | Value |
| --- | --- |
| Spec ID | 1428 |
| Slug | source-company-deliveryhero |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-deliveryhero` for **Delivery Hero** (Local delivery technology platform operating across many countries.). Sector:
Technology platform (online food and quick commerce). HQ: Berlin, Germany.

The company's live postings are served by **SmartRecruiters** on company
identifier `DeliveryHero` (`https://jobs.smartrecruiters.com/DeliveryHero`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-deliveryhero` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.DELIVERY_HERO`** in the source
> registry, so that a single `siteType: [Site.DELIVERY_HERO]` request returns
> Delivery Hero's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.DELIVERY_HERO = 'deliveryhero'` to the `Site` enum. | must |
| FR-2 | `DeliveryHeroService` implements `IScraper`, `@SourcePlugin({ site: Site.DELIVERY_HERO, name: 'Delivery Hero', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'DeliveryHero' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.DELIVERY_HERO`, `companyName = 'Delivery Hero'`, `id` prefix `sr-`→`deliveryhero-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Online food delivery and quick commerce
- Large-scale platform and logistics engineering
- Operations across 70+ countries
- Publicly traded (FSE: DHER)
