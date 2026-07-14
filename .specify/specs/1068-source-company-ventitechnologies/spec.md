# Spec: 1068 — Source Company Plugin: Venti Technologies

| Field | Value |
| --- | --- |
| Spec ID | 1068 |
| Slug | source-company-ventitechnologies |
| Status | accepted |
| Owner | claude (run #441) |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Supersedes | (none) |
| Related specs | 975, 5017 |

## Summary

New **Ashby-backed company-direct** source plugin `source-company-ventitechnologies` for
**Venti Technologies** (Develops safe-speed autonomous logistics vehicles for industrial sites.). Sector: Autonomy / Industrial logistics. HQ: Singapore.

The company's live postings are served by **Ashby** on job board
`goventi` (`https://jobs.ashbyhq.com/goventi`), which exposed
**27 live role(s)** at probe time (public Ashby Posting API,
`MIN_JOBS = 3` gate). Discovered and gated through the deterministic Ashby
company-source pipeline (`probe-ashby → assemble → scaffold-ashby → wire`) —
see `.specify/specs/975-ashby-company-source-pipeline/`.

## Constitution cross-check

- **TypeScript-only** — plugin is TS; no JS/Python. ✔
- **Modular / plugin** — a self-contained `source-company-ventitechnologies` package,
  installable/removable via the barrel + `Site` enum; no core changes. ✔
- **No peer imports** — delegates to the Ashby ATS plugin via `PluginRegistry`
  at runtime (never imports it directly). ✔
- **Performance** — zero extra network cost over the Ashby plugin it delegates
  to (single public job-board fetch); identity re-stamp is O(n) over jobs. ✔
- **No competitor references** — documented purely on the company's public
  merits. ✔

## User story

> As an **aggregator caller**, I want **`Site.VENTI_TECHNOLOGIES`** in the source
> registry, so that a single `siteType: [Site.VENTI_TECHNOLOGIES]` request returns
> Venti Technologies's live Ashby postings, re-stamped with the company identity.

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add `Site.VENTI_TECHNOLOGIES = 'ventitechnologies'` to the `Site` enum. | must |
| FR-2 | `VentiTechnologiesService` implements `IScraper`, `@SourcePlugin({ site: Site.VENTI_TECHNOLOGIES, name: 'Venti Technologies', category: 'company' })`. | must |
| FR-3 | Resolve the Ashby scraper from `PluginRegistry`; delegate `scrape({ ...input, companySlug: 'goventi' })`. | must |
| FR-4 | Re-stamp each `JobPostDto`: `site = Site.VENTI_TECHNOLOGIES`, `companyName = 'Venti Technologies'`, `id` prefix `ashby-`→`ventitechnologies-`. | must |
| FR-5 | Fail-safe: return an empty `JobResponseDto` when Ashby is unavailable / unregistered. | must |
| FR-6 | tsconfig path-alias + jest moduleNameMapper + barrel registration. | must |
| FR-7 | Mocked unit suite green (DI resolution, enum value, delegation, pass-through, resilience, cap). | must |

## Highlights

- Safe-speed autonomous logistics vehicles
- Deployed at industrial and logistics sites
- Offices in Singapore, USA, and China
