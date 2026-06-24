# Plan: 5003 — Rippling pagination and job details (formerly Spec 744)

| Field | Value |
| --- | --- |
| Spec ID | 5003 |
| Slug | source-ats-rippling-pagination-and-details |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-21 |
| Last updated | 2026-06-22 |

1. Replace the single-page scrape with a zero-based pagination loop and stable-ID accumulation.
2. Tighten list-record admission to exclude dehydrated filter data and stop safely on repeated pages.
3. Add the public detail URL and detail-response description types.
4. Enrich missing descriptions after admission and deduplication in batches of five.
5. Format descriptions, extract emails, and isolate detail failures per job.
6. Complete type, company/apply URL, and location fallback mappings.
7. Extend the focused Rippling suite across pagination, admission, enrichment, formatting, and mapping.
8. Run package-focused tests, TypeScript validation, and documentation lint.

## Risks

- Pagination redirects may repeat prior pages; no-new-ID detection provides a deterministic stop.
- Per-job details add latency; skip unnecessary calls and cap concurrency at five.
- Detail failures must preserve list jobs and not abort the scrape.
- Dehydrated state mixes queries; strict job admission prevents filter metadata from leaking into results.
