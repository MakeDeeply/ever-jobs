# Spec 1375 — SmartRecruiters Company-Source Pipeline (probe → assemble → scaffold → wire)

| Field | Value |
| --- | --- |
| Spec ID | 1375 |
| Slug | smartrecruiters-company-source-pipeline |
| Status | foundation-shipped |
| Owner | agent (run #443) |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |
| Related specs | 1194 (Lever pipeline), 975 (Ashby pipeline) |

## Summary

A deterministic, conflict-free pipeline for generating **SmartRecruiters-backed
company-direct** source plugins — the fourth sibling of the existing Greenhouse
(`probe-company-source`), Ashby (`probe-ashby-company-source`, Spec 975), and
Lever (`probe-lever-company-source`, Spec 1194) company-source pipelines.

The company-direct corpus is currently split across three backends: **Greenhouse**
(the largest share), **Ashby** (~219 plugins), and **Lever** (~180 plugins). A
fourth major zero-auth ATS — **SmartRecruiters**
(`https://jobs.smartrecruiters.com/<Identifier>`, public Posting API
`https://api.smartrecruiters.com/v1/companies/<Identifier>/postings?limit=100`) —
hosts the careers pages of a large population of **enterprise and mid-market
brands** (e.g. Visa, Bosch, Western Digital, ServiceNow) that are invisible to
the Greenhouse, Ashby, and Lever discovery gates. The `source-ats-smartrecruiters`
plugin already ships and is registered under `Site.SMARTRECRUITERS`; this pipeline
makes companies on that backend discoverable as first-class company-direct plugins
by adding a SmartRecruiters probe + SmartRecruiters scaffolder that reuse the
existing backend-agnostic wiring (`scripts/wire-company-source.ts`).

## Motivation

- **Diversify the backend mix** of the company-direct corpus onto a fourth major
  ATS beyond Greenhouse, Ashby, and Lever — skewed toward **large enterprise
  brands**, which SmartRecruiters over-indexes on.
- **Reach companies no existing probe can** (their boards 404 on Greenhouse,
  Ashby, and Lever but are live on SmartRecruiters).
- **Stay DRY**: the generated plugin delegates to the already-maintained
  SmartRecruiters ATS plugin via the `PluginRegistry`, inheriting every field fix
  (structured location composition, department mapping, remote inference,
  description-section assembly) — no bespoke SmartRecruiters parsing per company.

## Backend contract (what makes SmartRecruiters distinct)

| Aspect | Greenhouse | Ashby | Lever | **SmartRecruiters** |
| --- | --- | --- | --- | --- |
| Public list endpoint | `boards-api…/embed/jobs` | `posting-api…/job-board` | `api.lever.co/v0/postings/<slug>` | `api.smartrecruiters.com/v1/companies/<slug>/postings` |
| Wire shape | `{ jobs: [...] }` | `{ jobs: [...] }` (GraphQL-ish) | **bare array** | **`{ offset, limit, totalFound, content: [...] }` envelope** |
| Board display name on wire | yes (`name`) | no | no | **yes** (`content[0].company.name`) |
| Title field | `title` | `title` | `text` | **`name`** |
| Location | `location.name` | structured | `categories.allLocations[0]` | **structured `{ city, region, country, remote, fullLocation }`** |
| id prefix (backend) | `gh-` | `ashby-` | `lever-` | **`sr-`** |
| Slug case | lowercase | lowercase | lowercase | **PascalCase / case-sensitive identifier** |

The **case-sensitive identifier** is the one operational wrinkle: the plugin
`slug` (dir/enum value/id prefix) is the usual clean, hyphen-free lowercase token,
while the descriptor's separate **`companySlug`** carries the exact
SmartRecruiters identifier (e.g. `BoschGroup`, `WesternDigital`) that the public
API is keyed on — mirroring the Lever `slug`≠`companySlug` split (Q-LEVER-2).

## Constitution cross-check

- **TypeScript-only** — probe, scaffolder, and generated plugins are all TS. ✔
- **Modular / plugin** — every generated company is a self-contained package
  behind the barrel + `Site` enum; the pipeline touches only additive files. ✔
- **No peer imports** — generated services resolve the SmartRecruiters ATS plugin
  via `PluginRegistry` at runtime. ✔
- **Performance** — probe is a bounded-concurrency (16) worker pool; pure
  decision surface is O(n) over postings; generated plugins add zero network cost
  over the delegated backend. ✔
- **No competitor references** — the ATS backend is infrastructure, not a
  competitor; nothing in-repo references competitor products. ✔
- **Additive only** — the pipeline never edits or removes an existing plugin. ✔

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | `scripts/probe-smartrecruiters-company-source.ts` — pure, unit-tested `gateBoard`/`extractListings` + a bounded-concurrency live probe over a candidate-slug file, emitting a survivors JSON. | must |
| FR-2 | Gate is count-based (`content.length >= MIN_JOBS = 3`, each `name`-bearing). Board display name captured from `content[0].company.name` (informational). | must |
| FR-3 | `scripts/scaffold-smartrecruiters-company-source.ts` — pure file emitter for the full `source-company-<slug>` package + spec/plan/tasks, delegating to `Site.SMARTRECRUITERS`, re-stamping `sr-`→`<slug>-`. | must |
| FR-4 | Descriptor carries a distinct `companySlug` (case-sensitive live identifier) separate from `slug` (hyphen-free dir/enum value/id prefix). | must |
| FR-5 | Reuse `scripts/wire-company-source.ts` unchanged (descriptor is field-compatible). | must |
| FR-6 | Probe unit suite green; end-to-end smoke test (scaffold → wire → jest → revert) green before any real batch. | must |

## Verification (foundation run)

- Probe unit suite: **15/15 green** (`scripts/__tests__/probe-smartrecruiters-company-source.spec.ts`).
- Live endpoint confirmed against `Visa`, `BoschGroup` (4647 roles), `WesternDigital`
  (290), `ServiceNow` (396) — HTTP 200, `{ content: [...] }` envelope.
- End-to-end smoke: throwaway descriptor scaffolded → wired into the 4 shared
  files → generated plugin jest **9/9 green** → fully reverted, `git status` clean.

## Follow-ups

- First real batch of SmartRecruiters company plugins lands under Specs 1376+
  (see `docs/log.md` run #443).
- Open question Q-SR-1 (count-only gate, brand-match deferred to descriptor
  assembly) and Q-SR-2 (`slug`≠`companySlug` case-sensitivity) recorded in
  `docs/questions.md`.
