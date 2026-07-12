# Spec 1677 — Workable Company-Source Pipeline (probe → assemble → scaffold → wire)

| Field | Value |
| --- | --- |
| Spec ID | 1677 |
| Slug | workable-company-source-pipeline |
| Status | foundation-shipped |
| Owner | agent (run #445) |
| Created | 2026-07-06 |
| Last updated | 2026-07-06 |
| Related specs | 1593 (Recruitee pipeline), 1375 (SmartRecruiters pipeline), 1194 (Lever pipeline), 975 (Ashby pipeline) |

## Summary

A deterministic, conflict-free pipeline for generating **Workable-backed
company-direct** source plugins — the sixth sibling of the existing Greenhouse
(`probe-company-source`), Ashby (`probe-ashby-company-source`, Spec 975), Lever
(`probe-lever-company-source`, Spec 1194), SmartRecruiters
(`probe-smartrecruiters-company-source`, Spec 1375), and Recruitee
(`probe-recruitee-company-source`, Spec 1593) company-source pipelines.

The company-direct corpus is currently split across five backends: **Greenhouse**
(the largest share), **Ashby** (~218 plugins), **Lever** (~180 plugins),
**SmartRecruiters** (~217 plugins), and **Recruitee** (~83 plugins). A sixth
major zero-auth ATS — **Workable** (public widget careers API
`https://apply.workable.com/api/v1/widget/accounts/<slug>`) — hosts the careers
pages of a very large population of **global startup and SMB brands** that are
invisible to the five existing discovery gates. The `source-ats-workable` plugin
already ships and is registered under `Site.WORKABLE`; this pipeline makes
companies on that backend discoverable as first-class company-direct plugins by
adding a Workable probe + Workable scaffolder that reuse the existing
backend-agnostic wiring (`scripts/wire-company-source.ts`).

## Motivation

- **Diversify the backend mix** of the company-direct corpus onto a sixth major
  ATS beyond Greenhouse, Ashby, Lever, SmartRecruiters, and Recruitee — skewed
  toward the **very large global startup / SMB population** that Workable
  over-indexes on (Workable is one of the most widely-adopted SMB ATSes
  worldwide).
- **Reach companies no existing probe can** (their boards 404 on Greenhouse,
  Ashby, Lever, SmartRecruiters, and Recruitee but are live on Workable).
- **Stay DRY**: the generated plugin delegates to the already-maintained
  Workable ATS plugin via the `PluginRegistry`, inheriting every field fix
  (structured `city/state/region/country` location, department mapping, remote
  flag via `telecommuting`/workplace, salary extraction from the detail body,
  HTML description handling) — no bespoke Workable parsing per company.

## Backend contract (what makes Workable distinct)

| Aspect | Greenhouse | Lever | SmartRecruiters | Recruitee | **Workable** |
| --- | --- | --- | --- | --- | --- |
| Public list endpoint | `boards-api…/embed/jobs` | `api.lever.co/v0/postings/<slug>` | `api.smartrecruiters.com/v1/companies/<slug>/postings` | `https://<slug>.recruitee.com/api/offers` | `https://apply.workable.com/api/v1/widget/accounts/<slug>` |
| Host model | shared API host | shared API host | shared API host | per-company subdomain | **shared API host** |
| Wire shape | `{ jobs: [...] }` | bare array | `{ …, content: [...] }` envelope | `{ offers: [...] }` envelope | **`{ jobs: [...] }` envelope** |
| Board display name on wire | yes (`name`) | no | yes | yes (`company_name`) | **yes (envelope `name`, usually the slug)** |
| Title field | `title` | `text` | `name` | `title` | **`title`** |
| Per-job stable id | `id` | `id` | `id` | `id` | **`shortcode`** |
| Location | `location.name` | `categories.allLocations[0]` | structured | pre-composed + `city/state/country` | **`locations[]` + flat `city/state/country`** |
| Remote signal | — | — | — | `remote` | **`telecommuting` + detail `workplace`** |
| id prefix (backend) | `gh-` | `lever-` | `sr-` | `recruitee-` | **`workable-`** |

Two things make Workable distinct in the family:

1. **The stable per-job id is `shortcode`** (not `id`), so `extractListings`
   reads `shortcode` (falling back to `code`).
2. **The widget `name` is usually just the account slug echoed back** (not a
   polished brand name), so although it is captured into `boardName` for parity,
   the gate stays purely count-based and the canonical `displayName` is always
   supplied downstream at descriptor-assembly time. Workable is a **shared-host**
   backend (like Greenhouse), so the slug is a path segment, not a subdomain; the
   descriptor's `companySlug` is the exact Workable account slug and the plugin
   `slug` (dir/enum value/id prefix) is a hyphen-free token derived from the
   canonical display name.

One operational note: the Workable ATS plugin's public path additionally fetches
each job's public **v2 detail** (rich body + work-mode) under bounded concurrency
after the widget list. That fan-out is fully owned by the delegated
`source-ats-workable` plugin — the company-direct plugin adds zero extra network
cost of its own.

## Constitution cross-check

- **TypeScript-only** — probe, assembler, scaffolder, and generated plugins are
  all TS. ✔
- **Modular / plugin** — every generated company is a self-contained package
  behind the barrel + `Site` enum; the pipeline touches only additive files. ✔
- **No peer imports** — generated services resolve the Workable ATS plugin via
  `PluginRegistry` at runtime. ✔
- **Performance** — probe is a bounded-concurrency (16) worker pool; pure decision
  surface is O(n) over jobs; generated plugins add zero network cost over the
  delegated backend. ✔
- **No competitor references** — the ATS backend is infrastructure, not a
  competitor; nothing in-repo references competitor products. ✔
- **Additive only** — the pipeline never edits or removes an existing plugin. ✔

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | `scripts/probe-workable-company-source.ts` — pure, unit-tested `gateBoard`/`extractListings`/`boardUrl` + a bounded-concurrency live probe over a candidate-slug file, emitting a survivors JSON. | must |
| FR-2 | Gate is count-based (`jobs.length >= MIN_JOBS = 3`, each `title`-bearing). `boardName` captured from the envelope `name` (informational; usually the slug). | must |
| FR-3 | `scripts/scaffold-workable-company-source.ts` — pure file emitter for the full `source-company-<slug>` package + spec/plan/tasks, delegating to `Site.WORKABLE`, re-stamping `workable-`→`<slug>-`. | must |
| FR-4 | `scripts/assemble-workable-batch.ts` — joins survivors + factual enrichment into the descriptor batch, deriving mechanical identifiers and rejecting collisions against `site.enum.ts`. | must |
| FR-5 | Descriptor carries a distinct `companySlug` (live Workable account slug) separate from `slug` (hyphen-free dir/enum value/id prefix). | must |
| FR-6 | Reuse `scripts/wire-company-source.ts` unchanged (descriptor is field-compatible). | must |
| FR-7 | Probe unit suite green; end-to-end smoke test (scaffold → wire → jest → revert) green before any real batch. | must |

## Verification (foundation run)

- Probe unit suite: **21/21 green** (`scripts/__tests__/probe-workable-company-source.spec.ts`).
- Live endpoint contract confirmed against known Workable accounts — HTTP 200,
  `{ jobs: [...] }` widget envelope carrying `shortcode` + `title`.
- End-to-end smoke: generated plugins scaffolded → wired into the 4 shared files
  → generated plugin jest green.

## Follow-ups

- First real batch of Workable company plugins lands under Specs 1678+ (see
  `docs/log.md` run #445).
- Open question Q-WORKABLE-1 (count-only gate, brand-match deferred to descriptor
  assembly) recorded in `docs/questions.md`.
