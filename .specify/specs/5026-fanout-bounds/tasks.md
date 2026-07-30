# Tasks: 5026 — Bounded search fan-out

- [x] **T01** — Extract the per-source closure into `JobsService.scrapeOne(site, scraper, input)`; body unchanged.
- [x] **T02** — `DEFAULT_SEARCH_CONCURRENCY` (64) and `DEFAULT_SEARCH_DEADLINE_MS` (120 000) constants with rationale.
- [x] **T03** — `search.concurrency` / `search.deadlineMs` in `apps/api/src/config/configuration.ts` (`EVER_JOBS_SEARCH_CONCURRENCY`, `EVER_JOBS_SEARCH_DEADLINE_MS`).
- [x] **T04** — Replace the unbounded `Promise.allSettled(map(...))` with a shared-cursor worker pool writing results by input index.
- [x] **T05** — Deadline check before starting each item; drain the remainder as skipped; `warn` log with the count.
- [x] **T06** — `ever_jobs_scraper_requests_total{status="deadline_skipped"}`.
- [x] **T07** — Repair `jobs.service.spec.ts`'s `createService` (stub `registry` / `configService` / `metrics`; the old `scraperMap` field is no longer read by the service).
- [x] **T08** — Tests: concurrency ceiling, serialisation at 1, deadline sheds work, `deadlineMs=0` disables, failing source does not stall peers.
- [x] **T09** — `docs/index.md` + `docs/log.md` entries.
- [ ] **T10** — Follow-up, needs Hust sign-off: drop `ScraperInputDto`'s `siteType = Object.values(Site)` constructor default so the default fan-out is the 11-site `defaults.siteNames` allowlist instead of the whole catalogue. Logged in `docs/questions.md`.
- [ ] **T11** — Follow-up: propagate an `AbortSignal` from `request.on('close')` into the fan-out so client disconnects cancel in-flight work.
