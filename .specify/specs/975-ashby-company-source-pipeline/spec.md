# Spec 975 — Ashby Company-Source Pipeline (probe → assemble → scaffold → wire)

| Field | Value |
| --- | --- |
| Spec ID | 975 |
| Slug | ashby-company-source-pipeline |
| Status | foundation-shipped |
| Owner | agent |
| Created | 2026-07-02 |
| Last updated | 2026-07-02 |
| Related specs | 5017, 5018, 5019 |

## Summary

A deterministic, conflict-free pipeline for generating **Ashby-backed
company-direct** source plugins — the sibling of the existing Greenhouse
company-source pipeline (`probe-company-source` → `assemble-company-batch` →
`scaffold-company-source` → `wire-company-source`).

Today the company-direct corpus is **~97 % Greenhouse** (803 of 829 plugins),
with only a handful of hand-written Ashby delegations
(`source-company-allencontrolsystems`, `source-company-openai`). Many
well-funded modern startups — especially AI/ML, developer-tools/infra, fintech,
crypto, data-infra, and security companies — host their careers on **Ashby**
(`https://jobs.ashbyhq.com/<slug>`) and are therefore invisible to the
Greenhouse-only discovery gate. This pipeline closes that gap by adding an
Ashby probe + Ashby scaffolder that reuse the existing backend-agnostic wiring.

## Motivation

- **Diversify the backend mix** of the company-direct corpus beyond Greenhouse.
- **Reach companies the Greenhouse probe cannot** (their boards 404 on
  Greenhouse but are live on Ashby).
- **Stay DRY**: the generated plugin delegates to the already-maintained Ashby
  ATS plugin via the `PluginRegistry`, inheriting every field fix — no bespoke
  Ashby parsing per company.

## Architecture

```
candidate slugs ──▶ probe-ashby-company-source.ts ──▶ survivors.json
                     (public Ashby Posting API,          (slug, jobCount,
                      MIN_JOBS=3 gate, pure helpers)       listings[≤3])
                                                              │
enrichment.json (factual prose, per slug) ──┐                │
numbering.json  (specNo/phaseNo, per slug) ─┤                │
                                            ▼                ▼
                                  (descriptor assembly — inline or a future
                                   assemble-ashby step) ──▶ batch-input.json
                                                              │
                    ┌─────────────────────────────────────────┤
                    ▼                                          ▼
      scaffold-ashby-company-source.ts             wire-company-source.ts
      (pure file emitter: package + spec)          (backend-agnostic; edits the
                                                    4 shared wiring files)
```

### Public Ashby Posting API (the probe target)

- Endpoint (zero-auth): `https://api.ashbyhq.com/posting-api/job-board/<slug>`
- Response shape: `{ apiVersion, jobs: [ { id, title, location, departmentName,
  publishedDate, descriptionHtml, descriptionPlain, jobUrl, applyUrl, isRemote,
  address{ postalAddress{…} }, … } ] }`
- **No board display name** is exposed (unlike Greenhouse's `board.name`), so
  the brand-match anchor moves to descriptor-assembly time — see Q-ASHBY-1.

### Gate

A candidate **survives** iff the endpoint returns HTTP 200 with a `jobs` array
of **≥ `MIN_JOBS` (3)** entries, each carrying a non-empty title.

### Generated plugin (per company)

A thin **registry-delegation** service identical in shape to
`source-company-allencontrolsystems`: resolve `Site.ASHBY` from the
`PluginRegistry`, delegate `scrape({ ...input, companySlug })`, re-stamp
`site` / `companyName` / `id` (`ashby-`→`<slug>-`). Fail-safe empty response
when Ashby is unregistered.

## Constitution cross-check

| Rule | Compliance |
|------|-----------|
| TypeScript-only | All scripts + generated plugins are TS. ✔ |
| Modular / plugin-first | Each company is a self-contained `source-company-<slug>` package; enable/disable via the barrel + `Site` enum. ✔ |
| No peer-plugin imports | Generated service resolves Ashby via `PluginRegistry`, never imports it. ✔ |
| Reuse over rebuild | Reuses the backend-agnostic `wire-company-source.ts`; delegates parsing to the Ashby ATS plugin. ✔ |
| Extreme performance | One public fetch per company (delegated); O(n) identity re-stamp; probe runs at concurrency 16. ✔ |
| Tests | Probe has pure-helper unit tests; every generated plugin ships a mocked unit suite. ✔ |
| No competitor references in-repo | Enrichment prose is strictly factual, company-only. ✔ |
| Additive only | New scripts + new plugins; no existing file removed. ✔ |

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | `probe-ashby-company-source.ts` probes the public Ashby Posting API and emits survivors (pure `gateBoard`/`extractListings` helpers, unit-tested, no live network in tests). | must |
| FR-2 | `scaffold-ashby-company-source.ts` emits, per descriptor, the full plugin package + `.specify` spec, delegating to Ashby via the registry. | must |
| FR-3 | Wiring reuses `wire-company-source.ts` (batch descriptor is field-compatible: `slug`/`moduleName`/`enumKey`/`displayName`/`specNo`/`phaseNo`). | must |
| FR-4 | The descriptor carries a distinct `companySlug` (Ashby board slug) separate from `slug` (plugin dir / enum value / id prefix). | must |
| FR-5 | Collision-guard: reject any descriptor whose `enumKey` / `className` / enum value collides with an existing plugin before wiring. | must |
| FR-6 | Full `tsc --noEmit` + generated mocked unit suites green before commit. | must |
| FR-7 | Per-company enrichment prose is factual and competitor-free. | must |

## Non-goals

- No authenticated Ashby Posting API usage (public zero-auth endpoint only).
- No live-network assertions in unit tests (fixtures only; live probe is a
  discovery-time step, not a test dependency).
- Does not replace or modify the Greenhouse pipeline (purely additive sibling).

## Open questions

See `docs/questions.md` **Q-ASHBY-1** (board-name brand anchor) and
**Q-ASHBY-2** (slug vs. plugin-dir naming for hyphenated Ashby slugs).
