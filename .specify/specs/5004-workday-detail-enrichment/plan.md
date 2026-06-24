# Plan 745 — Workday detail enrichment

| Field | Value |
| --- | --- |
| Spec ID | 5004 |
| Slug | workday-detail-enrichment |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-22 |
| Last updated | 2026-06-22 |

## Phase 1 — Contract and live-shape verification

- Verify X-energy's public search and detail endpoint shapes.
- Record description, location, metadata, failure, and concurrency contracts in `spec.md`.

## Phase 2 — Implementation

- Add a pure CXS detail URL helper and a detail concurrency constant.
- Extend Workday wire interfaces for fields observed in the public detail payload.
- Collect the bounded search result set before mapping.
- Fetch details in ordered batches with `Promise.allSettled` semantics.
- Merge each detail payload into `JobPostDto`, retaining summary fallbacks.
- Pass the full detail envelope to the mapper so top-level `hiringOrganization.name` supplies the
  source-authored company name while the tenant slug remains the fallback.

## Phase 3 — Regression verification

- Extend the Workday service test suite with detail fixtures and failure cases.
- Lock X-energy's branded `X-Energy, LLC` company name and the failed-detail slug fallback.
- Extend constants tests for detail URL construction.
- Run focused tests and typechecking; correct the spec if the verified implementation differs.

## Phase 4 — Documentation closeout

- Add Spec 5004 to `docs/index.md`.
- Add the verified change and test evidence to the top of `docs/log.md`.
- Record the single-field multi-location representation decision in `docs/questions.md`.

## Files/packages touched

- `.specify/specs/5004-workday-detail-enrichment/`
- `packages/plugins/source-ats-workday/src/`
- `packages/plugins/source-ats-workday/__tests__/`
- `docs/index.md`, `docs/log.md`, `docs/questions.md`

## Risks and mitigations

- **Request amplification:** limit detail calls to batches of five and only enrich selected results.
- **Tenant-specific payload variation:** make all detail fields optional and retain summary fallbacks.
- **One detail failure dropping a scrape:** settle calls independently and preserve list records.
- **Collapsed multi-location DTO:** use an explicit stable separator pending a future location-array
  contract.
