# Spec: 1243 — Source Company Plugin: e.l.f. Beauty

| Field | Value |
| --- | --- |
| Spec ID | 1243 |
| Slug | source-company-elfbeauty |
| Status | accepted |
| Owner | claude (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Supersedes | (none) |
| Related specs | 1194, 975 |

## Summary

New **Lever-backed company-direct** source plugin `source-company-elfbeauty` for
**e.l.f. Beauty** (Multi-brand cosmetics and skincare company selling online and through retailers.). Sector: Consumer / Beauty e-commerce. HQ: Oakland, California, USA.

The company's live postings are served by **Lever** on job board
`elfbeauty` (`https://jobs.lever.co/elfbeauty`), which exposed
**65 live role(s)** at probe time (public Lever Postings API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Lever
company-source pipeline (`probe-lever → assemble → scaffold-lever → wire`) —
see `.specify/specs/1194-lever-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-elfbeauty` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Lever ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Lever plugin it delegates
  to (single public postings fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.E_L_F_BEAUTY`** in the source
> registry, so that a single `siteType: [Site.E_L_F_BEAUTY]` request returns
> e.l.f. Beauty's live Lever postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.E_L_F_BEAUTY = 'elfbeauty'` to the `Site` enum. | must |
| FR-2 | `ELFBeautyService` implements `IScraper`, `@SourcePlugin({ site: Site.E_L_F_BEAUTY, name: 'e.l.f. Beauty', category: 'company' })`. | must |
| FR-3 | Resolve the Lever scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'elfbeauty' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.E_L_F_BEAUTY`, `companyName = 'e.l.f. Beauty'`, `id` prefix `lever-`→`elfbeauty-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Lever is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Multi-brand portfolio spanning cosmetics and skincare
- Sells direct-to-consumer, on Amazon, and via retailers
- Operates internationally with roles across digital and marketing
