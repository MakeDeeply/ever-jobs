# Plan: 5001 — Shared job-location parser (formerly Spec 742)

| Field | Value |
| --- | --- |
| Spec ID | 5001 |
| Slug | shared-job-location-parser |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-22 |
| Last updated | 2026-06-22 |

1. Define a small parser result contract using existing `LocationDto` and workplace fields.
2. Add canonical US postal-code validation without a runtime dependency.
3. Extract narrowly recognized parenthesized and slash-delimited workplace qualifiers.
4. Split only an exact validated `City, ST` remainder and preserve the complete input otherwise.
5. Export the helper from `@ever-jobs/common`.
6. Add focused unit tests for normalization, qualifier placement, fallback, and empty input.
7. Run common-package tests, TypeScript validation, and documentation lint.

## Risks

- Job-location text is open-ended; strict admission and lossless fallback prevent speculative parsing.
- Slash characters can be geographic content; only qualifier-only slash components are removed.
- Workplace wording can expand; the initial contract intentionally recognizes only hybrid and remote.

