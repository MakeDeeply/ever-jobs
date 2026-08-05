# Tasks: 5082 — Per-source zero-jobs reason diagnostics

- [ ] T01 — `packages/models`: add `dtos/scrape-diagnostics.dto.ts` (`ScrapeReason`, `ScrapeDiagnostics`, `SourceDiagnosticDto`, `classifyScrapeError`, `looksLikeChallenge`); export from `dtos/index.ts`. Acceptance: importable from `@ever-jobs/models`.
- [ ] T02 — `JobResponseDto`: optional `diagnostics?: ScrapeDiagnostics`, set via constructor arg. Acceptance: existing `new JobResponseDto(jobs)` calls unchanged.
- [ ] T03 — `source-ats-gusto-hosted`: real-message log + diagnostics on catch; `blocked`/`empty` on zero postings; `bad_input` on no slug. Acceptance: launch-error test → `browser_unavailable`.
- [ ] T04 — `source-company-desktopmetal`: same catch/diagnostics treatment. Acceptance: launch-error test → `browser_unavailable`.
- [ ] T05 — `source-company-truemetalsupply`: same catch/diagnostics treatment. Acceptance: launch-error test → `browser_unavailable`.
- [ ] T06 — `JobsService.searchJobsWithDiagnostics`; `searchJobs` delegates; build `perSource`. Acceptance: unit tests for ok/empty/rejected reasons.
- [ ] T07 — `JobsController`: include `per_source` on standard + paginated JSON; `[]` on cache hit.
- [ ] T08 — Unit tests: `classifyScrapeError`, `looksLikeChallenge`.
- [ ] T09 — Docs: `docs/index.md` + `docs/log.md`; `npm run lint:docs` clean; `tsc --noEmit` clean.
