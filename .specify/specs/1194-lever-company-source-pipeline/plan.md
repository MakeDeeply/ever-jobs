# Plan 1194 — Lever Company-Source Pipeline

| Field | Value |
| --- | --- |
| Spec | spec.md |
| Created | 2026-07-03 |
| Last updated | 2026-07-03 |

## Approach

Mirror the proven Ashby pipeline (Spec 975) one-to-one, changing only the
backend specifics:

| Concern | Ashby (Spec 975) | Lever (this spec) |
| --- | --- | --- |
| Public endpoint | `api.ashbyhq.com/posting-api/job-board/<slug>` | `api.lever.co/v0/postings/<slug>?mode=json` |
| Wire shape | `{ apiVersion, jobs: [...] }` (envelope) | bare `[...]` array |
| Title field | `title` | `text` |
| Location field | `location` (flat string) | `categories.allLocations[0]` / `categories.location` |
| Department field | `departmentName` / `department` | `categories.department` / `categories.team` |
| Timestamp | `publishedDate` / `publishedAt` (ISO) | `createdAt` (epoch millis) |
| Delegated `Site` | `Site.ASHBY` | `Site.LEVER` |
| id prefix rewrite | `ashby-`→`<slug>-` | `lever-`→`<slug>-` |

The generated service is a thin registry-delegating adaptor — no bespoke HTTP or
parsing — so it inherits every Lever field fix. Registration is applied by the
backend-agnostic `scripts/wire-company-source.ts` (reused unchanged).

## Deliverables (this run — foundation)

| File | Change |
|------|--------|
| `scripts/probe-lever-company-source.ts` | New deterministic probe (pure `gateBoard`/`extractListings`, bounded-concurrency pool). |
| `scripts/__tests__/probe-lever-company-source.spec.ts` | New — 13 unit tests, no live network. |
| `scripts/scaffold-lever-company-source.ts` | New pure file emitter (package + `.specify` spec per descriptor). |
| `.specify/specs/1194-lever-company-source-pipeline/` | This spec/plan/tasks. |

## First batch (Specs 1195+)

A parallel discovery workflow web-finds Lever-hosted companies across sectors and
self-verifies each against the public Postings API (≥3 live roles). The merged
set is slug-normalised, deduped against the existing corpus, re-probed centrally
through `scripts/probe-lever-company-source.ts` (the authoritative gate),
collision-checked against `site.enum.ts` + `packages/plugins/index.ts`, then
scaffolded + wired. Each survivor becomes a `source-company-<slug>` plugin under
its own spec.

## Verification

- Probe unit suite green (13/13).
- End-to-end smoke: scaffold a throwaway descriptor → wire it into the four
  shared files → `jest` on the generated plugin green → fully revert (git
  checkout of shared files, rm of throwaway package + spec dir; `git status`
  clean). Proves emitter + generated test + wiring before any real batch.
- Each real batch: `tsc --noEmit` + generated mocked unit suites green before
  commit.
