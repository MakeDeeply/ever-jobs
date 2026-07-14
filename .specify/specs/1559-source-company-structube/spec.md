# Spec: 1559 — Source Company Plugin: Structube

| Field | Value |
| --- | --- |
| Spec ID | 1559 |
| Slug | source-company-structube |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-structube` for **Structube** (Canadian modern furniture and home decor retailer with stores nationwide.). Sector:
Home furnishings retail. HQ: Montreal, Quebec, Canada.

The company's live postings are served by **SmartRecruiters** on company
identifier `Structube1` (`https://jobs.smartrecruiters.com/Structube1`),
which exposed **56 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-structube` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.STRUCTUBE`** in the source
> registry, so that a single `siteType: [Site.STRUCTUBE]` request returns
> Structube's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.STRUCTUBE = 'structube'` to the `Site` enum. | must |
| FR-2 | `StructubeService` implements `IScraper`, `@SourcePlugin({ site: Site.STRUCTUBE, name: 'Structube', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'Structube1' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.STRUCTUBE`, `companyName = 'Structube'`, `id` prefix `sr-`→`structube-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Canadian modern furniture retailer
- Store network across Canada
- Furniture, lighting, and home decor
- Physical stores plus e-commerce
