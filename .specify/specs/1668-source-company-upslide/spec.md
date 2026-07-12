# Spec: 1668 — Source Company Plugin: UpSlide

| Field | Value |
| --- | --- |
| Spec ID | 1668 |
| Slug | source-company-upslide |
| Status | accepted |
| Owner | claude (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Supersedes | (none) |
| Related specs | 1593, 1375, 1194, 975 |

## Summary

New **Recruitee-backed company-direct** source plugin
`source-company-upslide` for **UpSlide** (Productivity and document-automation software for Microsoft Office used by financial-services firms.). Sector:
B2B SaaS / Productivity software. HQ: Paris, France.

The company's live postings are served by **Recruitee** on subdomain
`upslide` (`https://upslide.recruitee.com`), which exposed
**6 live role(s)** at probe time (public Recruitee careers API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Recruitee
company-source pipeline (`probe-recruitee → assemble → scaffold-recruitee →
wire`) — see `.specify/specs/1593-recruitee-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-upslide` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Recruitee ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Recruitee plugin it
  delegates to (single public careers fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.UPSLIDE`** in the source
> registry, so that a single `siteType: [Site.UPSLIDE]` request returns
> UpSlide's live Recruitee postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.UPSLIDE = 'upslide'` to the `Site` enum. | must |
| FR-2 | `UpSlideService` implements `IScraper`, `@SourcePlugin({ site: Site.UPSLIDE, name: 'UpSlide', category: 'company' })`. | must |
| FR-3 | Resolve the Recruitee scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'upslide' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.UPSLIDE`, `companyName = 'UpSlide'`, `id` prefix `recruitee-`→`upslide-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Recruitee is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Verified Recruitee board: https://upslide.recruitee.com/api/offers returns 3 open offers
- Offices in Paris (HQ), London, New York, Singapore and Berlin
- Product targets document automation and branding for financial services
