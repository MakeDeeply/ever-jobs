# Plan 1593 — Recruitee Company-Source Pipeline

| Field | Value |
| --- | --- |
| Spec | spec.md |
| Created | 2026-07-05 |
| Last updated | 2026-07-05 |

## Approach

Clone the proven SmartRecruiters pipeline (Spec 1375) — itself the sibling of the
Lever (1194) and Ashby (975) pipelines — adjusting only the four backend
specifics:

1. **Host model** — Recruitee is per-company subdomain: the probe builds
   `https://<slug>.recruitee.com/api/offers` via a `boardUrl(slug)` helper rather
   than interpolating the slug into a shared-host path.
2. **Wire shape** — `{ offers: [...] }` envelope (like SmartRecruiters' `content`,
   unlike Lever/Ashby bare arrays). `gateBoard`/`extractListings` read `offers`.
3. **Field names** — title = `title`; department = `department`; location =
   pre-composed `location` else `city/state/country`; board name =
   `offers[0].company_name`; timestamp = loose `"YYYY-MM-DD HH:MM:SS UTC"`
   (normalised to ISO in the probe).
4. **id prefix** — the Recruitee ATS plugin stamps `recruitee-<offer.id>`; the
   generated delegation service re-stamps `recruitee-`→`<slug>-`.

The generated service stays a thin registry-delegating adaptor — no bespoke HTTP
or parsing — so it inherits every Recruitee field fix. Registration is applied by
the backend-agnostic `scripts/wire-company-source.ts` (reused unchanged).

## Deliverables

| File | Purpose |
|------|---------|
| `scripts/probe-recruitee-company-source.ts` | Discovery probe (pure `gateBoard`/`extractListings`/`boardUrl` + bounded-concurrency live pool). |
| `scripts/__tests__/probe-recruitee-company-source.spec.ts` | 19 unit tests, no live network. |
| `scripts/scaffold-recruitee-company-source.ts` | Pure package + spec/plan/tasks emitter, delegates to `Site.RECRUITEE`. |
| `scripts/assemble-recruitee-batch.ts` | Survivors + enrichment + spec-range → descriptor batch (collision-safe). |
| `.specify/specs/1593-recruitee-company-source-pipeline/` | This spec/plan/tasks. |

## Verification

- `npx jest scripts/__tests__/probe-recruitee-company-source.spec.ts` green.
- Live smoke against a known Recruitee board (`channable`).
- End-to-end: scaffold a throwaway descriptor → wire → jest the generated plugin →
  revert; `git status` clean.

## Rollout

First real batch (Specs 1594+) assembled from a live probe over a
discovery-sourced candidate list, then scaffolded + wired + tested in the same
run (#444), mirroring the SmartRecruiters run #443.
