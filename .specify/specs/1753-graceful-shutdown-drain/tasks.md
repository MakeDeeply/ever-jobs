# Tasks: 1753 — Drain in-flight searches on SIGTERM

| Field        | Value      |
| ------------ | ---------- |
| Spec ID      | 1753       |
| Status       | done       |
| Last updated | 2026-10-08 |

- [x] T1 — `resolveShutdownDrainTimeoutMs` + `configuration.ts` `shutdown` section. Acceptance: config unit tests (default 150 000, 430 000 at a 400 000 deadline, explicit, 0, junk).
- [x] T2 — `ShutdownDrainService`: counting middleware, refusal while draining, bounded wait, connection close on timeout, `onModuleDestroy`. Acceptance: service unit tests.
- [x] T3 — `GET /ready` (200 / 503) beside the service in the root `AppModule`. Acceptance: unit test + health e2e (full `AppModule`), and the metadata check that both stay on `AppModule`.
- [x] T4 — `installGracefulShutdown` in `main.ts`: middleware, one-shot SIGTERM listener before Nest's, `enableShutdownHooks(['SIGTERM'], { useProcessExit: true })`. Acceptance: order test; integration test through Nest's own SIGTERM handler (drain before teardown, timeout bound, exit 0).
- [x] T5 — Docs: `.env.example`, `docs/DEPLOYMENT.md` (probe paths, preStop, grace period), `docs/API_CHANGELOG.md`, `docs/UPGRADE_GUIDE.md`, `docs/index.md`, `docs/log.md`.
- [ ] T6 — (deployment, outside this repo) `terminationGracePeriodSeconds: 460`, a 10 s preStop sleep and `readinessProbe` on `/ready` in the ever-jobs deployments; verify on dev by rolling the deployment during a list-mode NDJSON crawl and checking the stream ends with its `end` line.
