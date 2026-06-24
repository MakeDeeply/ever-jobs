# Tasks: 5017 — Allen Control Systems repoint to Ashby via registry delegation (formerly Spec 759)

1. [x] Rewrite `allencontrolsystems.service.ts`: inject `@Optional()
       PluginRegistry`, resolve `getScraper(Site.ASHBY)`, delegate with
       `companySlug: 'allen-control-systems'`, re-stamp
       `site`/`companyName`/`id` prefix, fail-safe empty response when Ashby is
       unavailable. Remove the inlined Greenhouse fetch+map.
2. [x] Rewrite the service header doc comment (Ashby source + delegation
       rationale; note the previous Greenhouse board was stale).
3. [x] Replace `__tests__/fixtures/allencontrolsystems-jobs.json` with an
       Ashby-board-shaped payload for slug `allen-control-systems`.
4. [x] Rewrite `allencontrolsystems.service.spec.ts`: DI scaffolding; happy path
       via a real `AshbyService` in a `PluginRegistry` with mocked HTTP client;
       input pass-through + id-prefix edge via a fake `IScraper`; no-registry /
       no-Ashby resilience; `resultsWanted` cap.
5. [x] Run `npx jest source-company-allencontrolsystems` — green (10 cases).
6. [x] Run `npm run build` / clean `api:build` — compiles.
7. [x] Add spec triad 759; append `docs/log.md`; add the 759 row to
       `docs/index.md`.
8. [ ] Commit on a branch off `origin/makedeeply` and open the ever-jobs PR.

## Acceptance criteria

- Service resolves Ashby **only** via `PluginRegistry` (no
  `import { AshbyService }` in service source); honours the no-peer-import rule.
- Delegated scrape uses slug `allen-control-systems` and re-stamps the company
  identity on every job; Greenhouse is no longer contacted.
- Suite green; clean build passes; spec triad + docs updated.
