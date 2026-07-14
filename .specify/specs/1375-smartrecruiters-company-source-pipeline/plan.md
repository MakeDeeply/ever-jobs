# Plan 1375 — SmartRecruiters Company-Source Pipeline

| Field | Value |
| --- | --- |
| Spec | spec.md |
| Created | 2026-07-04 |
| Last updated | 2026-07-04 |

## Approach

Clone the proven Lever pipeline (Spec 1194), adapting only the four backend
differences:

1. **API host / path** — `https://api.smartrecruiters.com/v1/companies/<slug>/postings?limit=100`.
2. **Wire shape** — a `{ offset, limit, totalFound, content: [...] }` envelope
   (not a bare array); `gateBoard`/`extractListings` read `content`.
3. **Field names** — title `name`, structured `location`, `department.label`,
   ISO `releasedDate`, `company.name` (board display name available on wire).
4. **id prefix** — `sr-` → `<slug>-`; delegate to `Site.SMARTRECRUITERS`.

The generated service is a thin registry-delegating adaptor (no bespoke HTTP or
parsing), so it inherits every SmartRecruiters field fix. Registration is applied
by the backend-agnostic `scripts/wire-company-source.ts`, reused unchanged.

## Files (foundation)

| File | Change |
|------|--------|
| `scripts/probe-smartrecruiters-company-source.ts` | New — pure gate + bounded-concurrency live probe. |
| `scripts/__tests__/probe-smartrecruiters-company-source.spec.ts` | New — 15 unit tests, no live network. |
| `scripts/scaffold-smartrecruiters-company-source.ts` | New — pure per-descriptor file emitter. |
| `scripts/wire-company-source.ts` | Reused unchanged (backend-agnostic). |
| `.specify/specs/1375-smartrecruiters-company-source-pipeline/` | This spec/plan/tasks. |

## Batch procedure (per run)

1. Discover candidate SmartRecruiters identifiers across sectors (parallel
   multi-agent web discovery), each self-verified against the live Posting API.
2. Slug-normalise + dedupe; collision-check against live `site.enum.ts` +
   `packages/plugins/index.ts`.
3. Re-probe centrally through `probe-smartrecruiters-company-source.ts` (the
   authoritative gate).
4. Assemble descriptors (className/moduleName/enumKey from `displayName`;
   `companySlug` = exact case-sensitive identifier).
5. `scaffold-smartrecruiters-company-source.ts` → `wire-company-source.ts`.
6. `jest` on the new packages; `tsc --noEmit`; commit + push; watch CI green.

## Verification

- Probe unit suite green (no live network).
- End-to-end smoke test (scaffold → wire → jest → revert) green before any real
  batch is generated.
