# Spec: 1554 — Source Company Plugin: Stanford Medicine Children's Health

| Field | Value |
| --- | --- |
| Spec ID | 1554 |
| Slug | source-company-stanfordmedicinechildrenshealth |
| Status | accepted |
| Owner | claude (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Supersedes | (none) |
| Related specs | 1375, 1194, 975 |

## Summary

New **SmartRecruiters-backed company-direct** source plugin
`source-company-stanfordmedicinechildrenshealth` for **Stanford Medicine Children's Health** (Pediatric and obstetric academic health care system affiliated with Stanford Medicine.). Sector:
Healthcare / Pediatric Hospital. HQ: Palo Alto, California, USA.

The company's live postings are served by **SmartRecruiters** on company
identifier `StanfordMedicineChildrensHealth` (`https://jobs.smartrecruiters.com/StanfordMedicineChildrensHealth`),
which exposed **100 live role(s)** at probe time (public SmartRecruiters
Posting API, `MIN_JOBS = 3` gate). Discovered and gated through the deterministic
SmartRecruiters company-source pipeline (`probe-smartrecruiters → assemble →
scaffold-smartrecruiters → wire`) — see
`.specify/specs/1375-smartrecruiters-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-stanfordmedicinechildrenshealth` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the SmartRecruiters ATS plugin via
  `PluginRegistry` at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the SmartRecruiters plugin it
  delegates to (single public Posting fetch); identity re-stamp is O(n) over
  jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.STANFORD_MEDICINE_CHILDREN_S_HEALTH`** in the source
> registry, so that a single `siteType: [Site.STANFORD_MEDICINE_CHILDREN_S_HEALTH]` request returns
> Stanford Medicine Children's Health's live SmartRecruiters postings, re-stamped with the company
> identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.STANFORD_MEDICINE_CHILDREN_S_HEALTH = 'stanfordmedicinechildrenshealth'` to the `Site` enum. | must |
| FR-2 | `StanfordMedicineChildrenSHealthService` implements `IScraper`, `@SourcePlugin({ site: Site.STANFORD_MEDICINE_CHILDREN_S_HEALTH, name: 'Stanford Medicine Children's Health', category: 'company' })`. | must |
| FR-3 | Resolve the SmartRecruiters scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'StanfordMedicineChildrensHealth' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.STANFORD_MEDICINE_CHILDREN_S_HEALTH`, `companyName = 'Stanford Medicine Children's Health'`, `id` prefix `sr-`→`stanfordmedicinechildrenshealth-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when SmartRecruiters is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Pediatric and obstetric academic health system
- Includes Lucile Packard Children's Hospital
- Affiliated with Stanford Medicine
- Specialty and subspecialty pediatric care
