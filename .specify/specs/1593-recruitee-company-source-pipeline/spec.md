# Spec 1593 — Recruitee Company-Source Pipeline (probe → assemble → scaffold → wire)

| Field | Value |
| --- | --- |
| Spec ID | 1593 |
| Slug | recruitee-company-source-pipeline |
| Status | foundation-shipped |
| Owner | agent (run #444) |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |
| Related specs | 1375 (SmartRecruiters pipeline), 1194 (Lever pipeline), 975 (Ashby pipeline) |

## Summary

A deterministic, conflict-free pipeline for generating **Recruitee-backed
company-direct** source plugins — the fifth sibling of the existing Greenhouse
(`probe-company-source`), Ashby (`probe-ashby-company-source`, Spec 975), Lever
(`probe-lever-company-source`, Spec 1194), and SmartRecruiters
(`probe-smartrecruiters-company-source`, Spec 1375) company-source pipelines.

The company-direct corpus is currently split across four backends: **Greenhouse**
(the largest share), **Ashby** (~218 plugins), **Lever** (~180 plugins), and
**SmartRecruiters** (~217 plugins). A fifth major zero-auth ATS — **Recruitee**
(`https://<slug>.recruitee.com`, public careers API
`https://<slug>.recruitee.com/api/offers`) — hosts the careers pages of a large
population of **European (NL/DE/BE/FR) SMB and scale-up brands** that are
invisible to the four existing discovery gates. The `source-ats-recruitee` plugin
already ships and is registered under `Site.RECRUITEE`; this pipeline makes
companies on that backend discoverable as first-class company-direct plugins by
adding a Recruitee probe + Recruitee scaffolder that reuse the existing
backend-agnostic wiring (`scripts/wire-company-source.ts`).

## Motivation

- **Diversify the backend mix** of the company-direct corpus onto a fifth major
  ATS beyond Greenhouse, Ashby, Lever, and SmartRecruiters — skewed toward
  **European SMB / scale-up brands**, which Recruitee over-indexes on.
- **Reach companies no existing probe can** (their boards 404 on Greenhouse,
  Ashby, Lever, and SmartRecruiters but are live on Recruitee).
- **Stay DRY**: the generated plugin delegates to the already-maintained
  Recruitee ATS plugin via the `PluginRegistry`, inheriting every field fix
  (structured `city/state/country` location, department mapping, remote flag,
  salary extraction, HTML description handling) — no bespoke Recruitee parsing per
  company.

## Backend contract (what makes Recruitee distinct)

| Aspect | Greenhouse | Lever | SmartRecruiters | **Recruitee** |
| --- | --- | --- | --- | --- |
| Public list endpoint | `boards-api…/embed/jobs` | `api.lever.co/v0/postings/<slug>` | `api.smartrecruiters.com/v1/companies/<slug>/postings` | `https://<slug>.recruitee.com/api/offers` |
| Host model | shared API host | shared API host | shared API host | **per-company subdomain** |
| Wire shape | `{ jobs: [...] }` | **bare array** | `{ …, content: [...] }` envelope | **`{ offers: [...] }` envelope** |
| Board display name on wire | yes (`name`) | no | yes (`content[0].company.name`) | **yes** (`offers[0].company_name`) |
| Title field | `title` | `text` | `name` | **`title`** |
| Location | `location.name` | `categories.allLocations[0]` | structured | **pre-composed `location` + `city/state/country`** |
| id prefix (backend) | `gh-` | `lever-` | `sr-` | **`recruitee-`** |

The **per-company subdomain host model** is the one operational wrinkle: unlike
the shared-host backends, each Recruitee board lives at its own subdomain, so the
probe interpolates the slug into the host (`https://<slug>.recruitee.com/api/offers`)
rather than a path segment. Recruitee subdomains are conventionally lowercase, so
the plugin `slug` (dir/enum value/id prefix) and the descriptor's separate
`companySlug` typically coincide; the split is retained for parity and to tolerate
any mixed-case subdomain.

## Constitution cross-check

- **TypeScript-only** — probe, scaffolder, and generated plugins are all TS. ✔
- **Modular / plugin** — every generated company is a self-contained package
  behind the barrel + `Site` enum; the pipeline touches only additive files. ✔
- **No peer imports** — generated services resolve the Recruitee ATS plugin via
  `PluginRegistry` at runtime. ✔
- **Performance** — probe is a bounded-concurrency (16) worker pool; pure decision
  surface is O(n) over offers; generated plugins add zero network cost over the
  delegated backend. ✔
- **No competitor references** — the ATS backend is infrastructure, not a
  competitor; nothing in-repo references competitor products. ✔
- **Additive only** — the pipeline never edits or removes an existing plugin. ✔

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | `scripts/probe-recruitee-company-source.ts` — pure, unit-tested `gateBoard`/`extractListings`/`boardUrl` + a bounded-concurrency live probe over a candidate-slug file, emitting a survivors JSON. | must |
| FR-2 | Gate is count-based (`offers.length >= MIN_JOBS = 3`, each `title`-bearing). Board display name captured from `offers[0].company_name` (informational). | must |
| FR-3 | `scripts/scaffold-recruitee-company-source.ts` — pure file emitter for the full `source-company-<slug>` package + spec/plan/tasks, delegating to `Site.RECRUITEE`, re-stamping `recruitee-`→`<slug>-`. | must |
| FR-4 | Descriptor carries a distinct `companySlug` (live subdomain identifier) separate from `slug` (hyphen-free dir/enum value/id prefix). | must |
| FR-5 | Reuse `scripts/wire-company-source.ts` unchanged (descriptor is field-compatible). | must |
| FR-6 | Probe unit suite green; end-to-end smoke test (scaffold → wire → jest → revert) green before any real batch. | must |

## Verification (foundation run)

- Probe unit suite: **19/19 green** (`scripts/__tests__/probe-recruitee-company-source.spec.ts`).
- Live endpoint confirmed against `channable` (34 roles) and `sendcloud` — HTTP
  200, `{ offers: [...] }` envelope carrying `company_name`.
- End-to-end smoke: throwaway descriptor scaffolded → wired into the 4 shared
  files → generated plugin jest green → fully reverted, `git status` clean.

## Follow-ups

- First real batch of Recruitee company plugins lands under Specs 1594+ (see
  `docs/log.md` run #444).
- Open question Q-RECRUITEE-1 (count-only gate, brand-match deferred to descriptor
  assembly) and Q-RECRUITEE-2 (per-subdomain host model) recorded in
  `docs/questions.md`.
