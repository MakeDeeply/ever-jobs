# Plan: 5005 — Rippling authoritative detail fields (formerly Spec 747)

| Field | Value |
| --- | --- |
| Spec ID | 5005 |
| Status | implemented |
| Created | 2026-06-22 |

1. Generalize Spec 5003's missing-description enrichment into selected-job detail enrichment.
2. Merge authoritative identity, creation timestamp, and employment type with independent list
   fallbacks while retaining description and apply-URL behavior.
3. Preserve the source timestamp and raw type label in the final DTO; keep normalized `jobType` as
   additive metadata.
4. Extend focused tests for the Boom reproduction, detail failure, and request concurrency.
5. Run focused Jest, package TypeScript validation, doc lint, and diff checks.

## Risks

- Fetching every detail increases requests; the existing five-request bound limits pressure.
- Whole-object replacement could erase useful list fields; merge only authoritative fields with
  null/blank-aware fallbacks.
- Date normalization could lose the offset and time; pass through the validated non-empty string.

