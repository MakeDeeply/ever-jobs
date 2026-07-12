# Spec: 1574 — Source Company Plugin: Ulbrich Stainless Steels & Special Metals

| Field | Value |
| --- | --- |
| Spec ID | 1574 |
| Slug | source-company-ulbrichstainlesssteelsspecialmetals |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-ulbrichstainlesssteelsspecialmetals` for **Ulbrich Stainless Steels & Special Metals** (Manufacturer of precision-rolled stainless steel strip, special metals, and shaped wire.). Sector:
Metals / Precision materials manufacturing. HQ: Wallingford, Connecticut, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `UlbrichSteel` (`https://jobs.smartrecruiters.com/UlbrichSteel`),
which exposed **13 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-ulbrichstainlesssteelsspecialmetals` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.ULBRICH_STAINLESS_STEELS_SPECIAL_METALS`** in the source
> registry, so that a single `siteType: [Site.ULBRICH_STAINLESS_STEELS_SPECIAL_METALS]` request returns
> Ulbrich Stainless Steels & Special Metals's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.ULBRICH_STAINLESS_STEELS_SPECIAL_METALS = 'ulbrichstainlesssteelsspecialmetals'` to the `Site` enum. | must |
| FR-2 | `UlbrichStainlessSteelsSpecialMetalsService` implements `IScraper`, `@SourcePlugin({ site: Site.ULBRICH_STAINLESS_STEELS_SPECIAL_METALS, name: 'Ulbrich Stainless Steels & Special Metals', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'UlbrichSteel' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.ULBRICH_STAINLESS_STEELS_SPECIAL_METALS`, `companyName = 'Ulbrich Stainless Steels & Special Metals'`, `id` prefix `sr-`→`ulbrichstainlesssteelsspecialmetals-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Manufactures precision-rolled stainless steel strip and shaped wire
- Family-owned, founded in 1924
- Production sites in the US, Mexico, and Austria
