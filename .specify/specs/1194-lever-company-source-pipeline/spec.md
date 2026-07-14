# Spec 1194 — Lever Company-Source Pipeline (probe → assemble → scaffold → wire)

| Field | Value |
| --- | --- |
| Spec ID | 1194 |
| Slug | lever-company-source-pipeline |
| Status | foundation-shipped |
| Owner | agent (run #442) |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |
| Related specs | 975 (Ashby pipeline), 5017 |

## Summary

A deterministic, conflict-free pipeline for generating **Lever-backed
company-direct** source plugins — the sibling of the existing Greenhouse
(`probe-company-source`) and Ashby (`probe-ashby-company-source`, Spec 975)
company-source pipelines.

The company-direct corpus is currently split between two backends: **Greenhouse**
(the large majority) and **Ashby** (~219 plugins after Spec 975's first batch).
A third major zero-auth ATS — **Lever** (`https://jobs.lever.co/<slug>`, public
Postings API `https://api.lever.co/v0/postings/<slug>?mode=json`) — hosts the
careers pages of a large population of scale-ups and mid-market companies that
are invisible to both the Greenhouse and Ashby discovery gates. The
`source-ats-lever` plugin already ships and is registered under `Site.LEVER`;
this pipeline makes companies on that backend discoverable as first-class
company-direct plugins by adding a Lever probe + Lever scaffolder that reuse the
existing backend-agnostic wiring.

## Motivation

- **Diversify the backend mix** of the company-direct corpus onto a third major
  ATS beyond Greenhouse and Ashby.
- **Reach companies neither existing probe can** (their boards 404 on Greenhouse
  and Ashby but are live on Lever).
- **Stay DRY**: the generated plugin delegates to the already-maintained Lever
  ATS plugin via the `PluginRegistry`, inheriting every field fix (location
  parsing, compensation, remote/hybrid inference) — no bespoke Lever parsing per
  company.

## Architecture

```
candidate slugs ──▶ probe-lever-company-source.ts ──▶ survivors.json
                     (public Lever Postings API,         (slug, jobCount,
                      MIN_JOBS=3 gate, pure helpers)       listings[≤3])
                                                              │
enrichment.json (factual prose, per slug) ──┐                │
numbering.json  (specNo/phaseNo, per slug) ─┤                │
                                            ▼                ▼
                                  (descriptor assembly — inline or a future
                                   assemble-lever step) ──▶ batch-input.json
                                                              │
                    ┌─────────────────────────────────────────┤
                    ▼                                          ▼
      scaffold-lever-company-source.ts             wire-company-source.ts
      (pure file emitter: package + spec)          (backend-agnostic; edits the
                                                    4 shared wiring files)
```

### Public Lever Postings API (the probe target)

- Endpoint (zero-auth): `https://api.lever.co/v0/postings/<slug>?mode=json`
- Response shape: a **bare JSON array** of postings —
  `[ { id, text, categories{ location, allLocations, department, team,
  commitment }, country, workplaceType, createdAt, descriptionPlain,
  description, hostedUrl, applyUrl, salaryRange{…} }, … ]`
- **No envelope and no board display name** (unlike Greenhouse's `board.name`;
  same absence as Ashby), so the brand-match anchor lives at descriptor-assembly
  time — see Q-LEVER-1.

### Gate

A candidate **survives** iff the endpoint returns HTTP 200 with a JSON **array**
of **≥ `MIN_JOBS` (3)** entries, each carrying a non-empty `text` (title).

### Generated plugin (per company)

A thin **registry-delegation** service identical in shape to the Ashby
delegation: resolve `Site.LEVER` from the `PluginRegistry`, delegate
`scrape({ ...input, companySlug })`, re-stamp `site` / `companyName` / `id`
(`lever-`→`<slug>-`). Fail-safe empty response when Lever is unregistered.

## Constitution cross-check

| Rule | Compliance |
|------|-----------|
| TypeScript-only | All scripts + generated plugins are TS. ✔ |
| Modular / plugin-first | Each company is a self-contained `source-company-<slug>` package; enable/disable via the barrel + `Site` enum. ✔ |
| No peer-plugin imports | Generated service resolves Lever via `PluginRegistry`, never imports it. ✔ |
| Reuse over rebuild | Reuses the backend-agnostic `wire-company-source.ts`; delegates parsing to the Lever ATS plugin. ✔ |
| Extreme performance | One public fetch per company (delegated); O(n) identity re-stamp; probe runs at concurrency 16. ✔ |
| Tests | Probe has pure-helper unit tests (13 green); every generated plugin ships a mocked unit suite. ✔ |
| No competitor references in-repo | Enrichment prose is strictly factual, company-only. ✔ |
| Additive only | New scripts + new plugins; no existing file removed. ✔ |

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | `probe-lever-company-source.ts` probes the public Lever Postings API and emits survivors (pure `gateBoard`/`extractListings` helpers, unit-tested, no live network in tests). | must |
| FR-2 | `scaffold-lever-company-source.ts` emits, per descriptor, the full plugin package + `.specify` spec, delegating to Lever via the registry. | must |
| FR-3 | Wiring reuses `wire-company-source.ts` (batch descriptor is field-compatible: `slug`/`moduleName`/`enumKey`/`displayName`/`specNo`/`phaseNo`). | must |
| FR-4 | The descriptor carries a distinct `companySlug` (live Lever slug) separate from `slug` (plugin dir / enum value / id prefix). | must |
| FR-5 | Collision-guard: reject any descriptor whose `enumKey` / `className` / enum value collides with an existing plugin before wiring. | must |
| FR-6 | Full `tsc --noEmit` + generated mocked unit suites green before commit. | must |
| FR-7 | Per-company enrichment prose is factual and competitor-free. | must |

## Non-goals

- No authenticated Lever Postings API usage (public zero-auth endpoint only; the
  Lever ATS plugin still upgrades to the authenticated path when a key is present
  at runtime).
- No live-network assertions in unit tests (fixtures only; live probe is a
  discovery-time step, not a test dependency).
- Does not replace or modify the Greenhouse or Ashby pipelines (purely additive
  third sibling).

## Open questions

See `docs/questions.md` **Q-LEVER-1** (board-name brand anchor, inherited from
the Ashby Q-ASHBY-1 resolution) and **Q-LEVER-2** (slug vs. plugin-dir naming
for hyphenated Lever slugs, inherited from Q-ASHBY-2).
